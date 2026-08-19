/**
 * Clock Service — per-session in-game clock and event scheduler.
 *
 * Time ratio: 60 real seconds = 1 in-game day (configurable via scenario config).
 * Clock is Redis-backed — survives process restarts (remaining delays stored on pause).
 * A single setInterval worker polls all active sessions for due events every 500ms.
 *
 * Pause/Resume: handled in session.service.ts (stores/restores remaining delays).
 * This module only drives the clock tick and fires due events.
 */

import {
  getDueEvents,
  removeFiredEvent,
  scheduleEvent,
  getRedis,
} from '../engine/worldState.redis';
import { readWorldState, mutateWorldState, markEventFired } from '../engine/worldState.engine';
import { getScenarioConfig } from '../config/scenarios/scenario.registry';
import { ensureDbConnected } from '../engine/worldState.engine';
import { initTimeline, handleTimelineEvent } from './timeline.scheduler';
import mongoose from 'mongoose';


// ── Constants ─────────────────────────────────────────────────────────────────

/** How often the scheduler worker polls (ms) */
const POLL_INTERVAL_MS = 500;

/** How many real ms = 1 in-game day (60 seconds by default) */
export const REAL_MS_PER_INGAME_DAY = 60_000;

/** How many real ms = 1 in-game hour */
export const REAL_MS_PER_INGAME_HOUR = REAL_MS_PER_INGAME_DAY / 24;

// ── Active session registry (in-process, lightweight) ─────────────────────────

/** Set of currently-tracked session IDs for the clock ticker */
const activeSessions = new Set<string>();

/** Per-session last real timestamp (for clock advance calculation) */
const lastTickMs: Map<string, number> = new Map();

// ── Event handler registry ────────────────────────────────────────────────────
// Orchestrator registers a handler here; clock service just fires it.

type EventHandler = (sessionId: string, eventRef: string) => Promise<void>;
let _eventHandler: EventHandler | null = null;

export function registerEventHandler(handler: EventHandler): void {
  _eventHandler = handler;
}

// ── Clock ticker ──────────────────────────────────────────────────────────────

let _workerStarted = false;

export function startClockWorker(): void {
  if (_workerStarted) return;
  _workerStarted = true;

  setInterval(async () => {
    if (activeSessions.size === 0) return;

    for (const sessionId of activeSessions) {
      try {
        await tickSession(sessionId);
      } catch (err) {
        // Don't let one broken session crash the worker
        console.error(`[CLOCK] Error ticking session ${sessionId}:`, err);
      }
    }
  }, POLL_INTERVAL_MS);

  console.log('[CLOCK] Worker started');
}

async function tickSession(sessionId: string): Promise<void> {
  const state = await readWorldState(sessionId);
  if (!state || state.clock.paused) return;

  const now = Date.now();
  const last = lastTickMs.get(sessionId) ?? now;
  const elapsedMs = now - last;
  lastTickMs.set(sessionId, now);

  // Advance in-game clock
  const newElapsed = state.clock.real_elapsed_ms + elapsedMs;
  const totalMinutesIngame = (newElapsed / REAL_MS_PER_INGAME_DAY) * 24 * 60;
  const daysPassed = Math.floor(totalMinutesIngame / (24 * 60));
  const minuteOfDay = totalMinutesIngame % (24 * 60);
  const hoursIngame = 9 + Math.floor(minuteOfDay / 60); // working day starts at 09:00
  const minutesIngame = Math.floor(minuteOfDay % 60);

  const ingame_day = 1 + daysPassed;
  const ingame_time = `${String(hoursIngame % 24).padStart(2, '0')}:${String(minutesIngame).padStart(2, '0')}`;

  await mutateWorldState(sessionId, () => ({
    clock: {
      ...state.clock,
      real_elapsed_ms: newElapsed,
      ingame_day,
      ingame_time,
    },
  }));

  // Fire any due scheduled events
  const dueEvents = await getDueEvents(sessionId);
  for (const eventRef of dueEvents) {
    await removeFiredEvent(sessionId, eventRef);
    // Route: character reply delivery OR timeline event OR orchestrator event
    if (eventRef.startsWith('char_reply:')) {
      if (_eventHandler) await _eventHandler(sessionId, eventRef);
    } else {
      // Timeline event — handled by timeline.scheduler
      await handleTimelineEvent(sessionId, eventRef);
      // Also run orchestrator to check conditional rules
      if (_eventHandler) await _eventHandler(sessionId, eventRef);
    }
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Register a session with the clock worker and pre-schedule its timeline */
export function startTracking(sessionId: string): void {
  activeSessions.add(sessionId);
  lastTickMs.set(sessionId, Date.now());
  // Pre-schedule all always-on timeline events
  initTimeline(sessionId).catch((err) =>
    console.error('[CLOCK] Timeline init failed:', err)
  );
  console.log(`[CLOCK] Tracking session ${sessionId}`);
}

/** Unregister a session */
export function stopTracking(sessionId: string): void {
  activeSessions.delete(sessionId);
  lastTickMs.delete(sessionId);
  console.log(`[CLOCK] Stopped tracking session ${sessionId}`);
}

/**
 * Schedule an event to fire at a specific real-time offset from now.
 * eventRef format: "<rule_id>" e.g. "hr_amendment"
 */
export async function scheduleGameEvent(
  sessionId: string,
  eventRef: string,
  delayMs: number
): Promise<void> {
  const fireAt = Date.now() + delayMs;
  await scheduleEvent(sessionId, eventRef, fireAt);
  console.log(`[CLOCK] Scheduled "${eventRef}" in ${delayMs}ms for session ${sessionId}`);
}

/**
 * Get current progress percentage for a session (0-100).
 * Used by orchestrator to evaluate time-based trigger conditions.
 */
export async function getSessionProgress(sessionId: string): Promise<number> {
  const state = await readWorldState(sessionId);
  if (!state) return 0;

  const config = getScenarioConfig(state.scenario_id);
  if (!config) return 0;

  // Total session real time = (scenario total ingame days) * REAL_MS_PER_INGAME_DAY
  const totalRealMs = config.totalIngameDays * REAL_MS_PER_INGAME_DAY;
  return Math.min(100, (state.clock.real_elapsed_ms / totalRealMs) * 100);
}

/**
 * World State Engine — the central read/write API.
 * Every service reads and writes World State through here only.
 * All mutations are atomic (findOneAndUpdate), write-through to Redis,
 * and emit a state:changed pub/sub event for the WebSocket gateway.
 */

import { v4 as uuidv4 } from 'uuid';
import { WorldStateModel, type WorldStateDocument } from './worldState.schema';
import {
  cacheWorldState,
  getCachedWorldState,
  deleteCachedWorldState,
  publishStateChanged,
} from './worldState.redis';
import type { WorldState, WorldStateEvent, EventType, ScoreableSignal } from './worldState.types';

// ── DB Connection ─────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import { ENV } from '../../config/env';

let dbConnected = false;

export async function ensureDbConnected(): Promise<void> {
  if (dbConnected || mongoose.connection.readyState === 1) return;
  await mongoose.connect(ENV.MONGODB_URI, {
    dbName: 'brained',
    serverSelectionTimeoutMS: 5000,
  });
  dbConnected = true;
  console.log('[MONGO] Connected to brained database');
}

// ── Core Read/Write ───────────────────────────────────────────────────────────

/**
 * Read World State — checks Redis hot cache first, falls back to Mongo.
 */
export async function readWorldState(sessionId: string): Promise<WorldState | null> {
  // Try cache first (sub-ms)
  const cached = await getCachedWorldState<WorldState>(sessionId);
  if (cached) return cached;

  // Fallback to Mongo
  await ensureDbConnected();
  const doc = await WorldStateModel.findOne({ session_id: sessionId }).lean();
  if (!doc) return null;

  // Re-warm the cache
  await cacheWorldState(sessionId, doc);
  return doc as unknown as WorldState;
}

/**
 * Atomic World State mutation.
 * Takes the current state, applies the mutator function, persists to Mongo,
 * writes through to Redis, and publishes a state:changed event.
 */
export async function mutateWorldState(
  sessionId: string,
  mutator: (state: WorldState) => Partial<WorldState> | Promise<Partial<WorldState>>,
  eventPayload?: { type: EventType; actor: string; target: string; payload?: Record<string, unknown> }
): Promise<WorldState> {
  await ensureDbConnected();

  // Read current state (from cache or Mongo)
  const current = await readWorldState(sessionId);
  if (!current) throw new Error(`World State not found for session: ${sessionId}`);

  // Build patch
  const patch = await mutator(current);

  // If an event was provided, append it to the event_log
  if (eventPayload) {
    const event: WorldStateEvent = {
      event_id: uuidv4(),
      type: eventPayload.type,
      actor: eventPayload.actor,
      target: eventPayload.target,
      payload: eventPayload.payload ?? {},
      ingame_ts: current.clock.ingame_time,
      real_ts: new Date(),
    };
    patch.event_log = [...(current.event_log ?? []), event];
  }

  // Write to Mongo atomically
  const updated = await WorldStateModel.findOneAndUpdate(
    { session_id: sessionId },
    { $set: patch },
    { new: true, lean: true }
  );
  if (!updated) throw new Error(`Mutation failed — session not found: ${sessionId}`);

  const newState = updated as unknown as WorldState;

  // Write-through to Redis
  await cacheWorldState(sessionId, newState);

  // Pub/sub notification for WebSocket gateway
  await publishStateChanged(sessionId, patch);

  return newState;
}

/**
 * Create a fresh World State document for a new session.
 * scenarioConfig provides the initial requirements, stakeholders, deadline, etc.
 */
export async function createWorldState(params: {
  sessionId: string;
  scenarioId: string;
  playerId: string;
  scenarioConfig: {
    requirements: string[];
    initiallyHidden: string[];
    boardDeadlineIngame: string;
    characters: string[];
    initialTrustScores: Record<string, number>;
  };
}): Promise<WorldState> {
  await ensureDbConnected();

  const { sessionId, scenarioId, playerId, scenarioConfig } = params;

  const doc = new WorldStateModel({
    session_id: sessionId,
    scenario_id: scenarioId,
    player_id: playerId,

    requirements: {
      discovered: [],
      hidden: scenarioConfig.requirements, // all hidden at start
      contradicted: [],
    },

    timeline: {
      board_deadline_ingame: scenarioConfig.boardDeadlineIngame,
      milestones_hit: [],
      milestones_missed: [],
    },

    stakeholder_trust: scenarioConfig.initialTrustScores,
    project_status: 'not_started',

    conversation_threads: scenarioConfig.characters.reduce(
      (acc, id) => ({ ...acc, [id]: [] }),
      {}
    ),

    fired_events: [],
    event_log: [],
    scoreable_signals: [],
    risks: [],
    outstanding_actions: [],
    pending_approvals: [],

    clock: {
      ingame_day: 1,
      ingame_time: '09:00',
      real_elapsed_ms: 0,
      paused: false,
    },

    mom: {
      raw_text: '',
      submitted_at: null,
      extracted: null,
    },

    presentation: {
      started_at: null,
      ended_at: null,
      recording_url: null,
      transcript: null,
      follow_up_questions: [],
      whisper_confidence: null,
    },

    evaluation: null,
  });

  await doc.save();
  const state = doc.toObject() as unknown as WorldState;
  await cacheWorldState(sessionId, state);
  return state;
}

// ── Convenience helpers ───────────────────────────────────────────────────────

/** Discover a requirement — moves it from hidden to discovered */
export async function discoverRequirement(
  sessionId: string,
  reqId: string,
  discoveredBy: string
): Promise<WorldState> {
  return mutateWorldState(
    sessionId,
    (state) => {
      if (state.requirements.discovered.includes(reqId)) return {};
      return {
        requirements: {
          ...state.requirements,
          discovered: [...state.requirements.discovered, reqId],
          hidden: state.requirements.hidden.filter((r) => r !== reqId),
        },
      };
    },
    {
      type: 'requirement_discovered',
      actor: discoveredBy,
      target: reqId,
      payload: { req_id: reqId },
    }
  );
}

/** Log a scoreable signal */
export async function logSignal(
  sessionId: string,
  signal: Omit<ScoreableSignal, 'logged_at'>
): Promise<void> {
  await mutateWorldState(sessionId, (state) => ({
    scoreable_signals: [
      ...state.scoreable_signals,
      { ...signal, logged_at: new Date() },
    ],
  }));
}

/** Update stakeholder trust score (clamps to 0-100) */
export async function updateTrust(
  sessionId: string,
  characterId: string,
  delta: number
): Promise<void> {
  await mutateWorldState(sessionId, (state) => {
    const current = state.stakeholder_trust[characterId] ?? 70;
    return {
      stakeholder_trust: {
        ...state.stakeholder_trust,
        [characterId]: Math.max(0, Math.min(100, current + delta)),
      },
    };
  });
}

/** Mark an orchestrator event as fired (prevents re-firing) */
export async function markEventFired(sessionId: string, eventId: string): Promise<void> {
  await mutateWorldState(sessionId, (state) => ({
    fired_events: [...state.fired_events, eventId],
  }));
}

/** Delete a world state (used on abandon) */
export async function deleteWorldState(sessionId: string): Promise<void> {
  await ensureDbConnected();
  await WorldStateModel.deleteOne({ session_id: sessionId });
  await deleteCachedWorldState(sessionId);
}

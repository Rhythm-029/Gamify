/**
 * Session Service — create, get, pause, resume, and abandon game sessions.
 * Sessions live in MongoDB (sessions collection) and reference World State by session_id.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  createWorldState,
  readWorldState,
  mutateWorldState,
  deleteWorldState,
  ensureDbConnected,
} from '../engine/worldState.engine';
import {
  scheduleEvent,
  getDueEvents,
  clearSchedule,
  storeRemainingDelays,
  getRemainingDelays,
  clearRemainingDelays,
  removeFiredEvent,
  getRedis,
} from '../engine/worldState.redis';
import { getScenarioConfig } from '../config/scenarios/scenario.registry';

// ── Session document schema ───────────────────────────────────────────────────

export interface SessionDocument extends Document {
  session_id: string;
  player_id: string;
  scenario_id: string;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  world_state_id: string;
  started_at: Date;
  ended_at: Date | null;
  reconnect_token: string;
}

const SessionSchema = new Schema<SessionDocument>(
  {
    session_id: { type: String, required: true, unique: true, index: true },
    player_id: { type: String, required: true, index: true },
    scenario_id: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'abandoned'],
      default: 'active',
    },
    world_state_id: { type: String, required: true },
    started_at: { type: Date, default: Date.now },
    ended_at: { type: Date, default: null },
    reconnect_token: { type: String, required: true },
  },
  { timestamps: true }
);

const SessionModel: Model<SessionDocument> =
  mongoose.models['Session'] ||
  mongoose.model<SessionDocument>('Session', SessionSchema);

// ── Service methods ───────────────────────────────────────────────────────────

/**
 * Create a brand-new session for a player.
 * Initialises World State from the scenario config.
 */
export async function createSession(
  playerId: string,
  scenarioId: string
): Promise<{ session_id: string; reconnect_token: string }> {
  await ensureDbConnected();

  const config = getScenarioConfig(scenarioId);
  if (!config) throw new Error(`Scenario not found: ${scenarioId}`);

  const sessionId = uuidv4();
  const reconnectToken = uuidv4();

  // Initialise World State
  await createWorldState({
    sessionId,
    scenarioId,
    playerId,
    scenarioConfig: {
      requirements: config.requirements.map((r) => r.id),
      initiallyHidden: config.requirements.map((r) => r.id),
      boardDeadlineIngame: config.boardDeadlineIngame,
      characters: config.characters.map((c) => c.id),
      initialTrustScores: config.characters.reduce(
        (acc, c) => ({ ...acc, [c.id]: c.initialTrust }),
        {}
      ),
    },
  });

  // Create session record
  await SessionModel.create({
    session_id: sessionId,
    player_id: playerId,
    scenario_id: scenarioId,
    status: 'active',
    world_state_id: sessionId, // same key as world state
    reconnect_token: reconnectToken,
  });

  console.log(`[SESSION] Created session ${sessionId} for player ${playerId} (${scenarioId})`);
  return { session_id: sessionId, reconnect_token: reconnectToken };
}

/**
 * Get a session + its World State.
 * Used on reconnect to re-sync the client.
 */
export async function getSession(sessionId: string): Promise<{
  session: SessionDocument | null;
  world_state: Awaited<ReturnType<typeof readWorldState>>;
}> {
  await ensureDbConnected();
  const session = await SessionModel.findOne({ session_id: sessionId }).lean() as unknown as SessionDocument | null;
  const world_state = await readWorldState(sessionId);
  return { session, world_state };
}

/**
 * Pause a session — freezes the clock and stores remaining delays for all
 * pending scheduled events so they can be restored accurately on resume.
 */
export async function pauseSession(sessionId: string): Promise<void> {
  await ensureDbConnected();

  const state = await readWorldState(sessionId);
  if (!state) throw new Error(`Session not found: ${sessionId}`);
  if (state.clock.paused) return; // already paused

  const now = Date.now();
  const redis = getRedis();

  // Get all pending scheduled events and compute remaining delay
  const allPending = await redis.zrangebyscore(
    `sched:${sessionId}`,
    now,
    '+inf',
    'WITHSCORES'
  );

  const remaining: Array<{ eventRef: string; remainingMs: number }> = [];
  for (let i = 0; i < allPending.length; i += 2) {
    const eventRef = allPending[i];
    const fireAt = Number(allPending[i + 1]);
    remaining.push({ eventRef, remainingMs: fireAt - now });
  }
  await storeRemainingDelays(sessionId, remaining);
  await clearSchedule(sessionId);

  // Freeze clock
  await mutateWorldState(sessionId, (s) => ({
    clock: { ...s.clock, paused: true, paused_at_real_ms: now },
  }));

  await SessionModel.updateOne({ session_id: sessionId }, { status: 'paused' });
  console.log(`[SESSION] Paused session ${sessionId} (${remaining.length} events held)`);
}

/**
 * Resume a session — restores remaining delays and rearms all scheduled events.
 */
export async function resumeSession(sessionId: string): Promise<void> {
  await ensureDbConnected();

  const state = await readWorldState(sessionId);
  if (!state) throw new Error(`Session not found: ${sessionId}`);
  if (!state.clock.paused) return; // already running

  const now = Date.now();
  const held = await getRemainingDelays(sessionId);

  // Re-arm each event from its remaining delay
  for (const { eventRef, remainingMs } of held) {
    await scheduleEvent(sessionId, eventRef, now + remainingMs);
  }
  await clearRemainingDelays(sessionId);

  // Unfreeze clock
  await mutateWorldState(sessionId, (s) => ({
    clock: { ...s.clock, paused: false, paused_at_real_ms: undefined },
  }));

  await SessionModel.updateOne({ session_id: sessionId }, { status: 'active' });
  console.log(`[SESSION] Resumed session ${sessionId} (${held.length} events restored)`);
}

/**
 * Complete a session (called after report is generated).
 */
export async function completeSession(sessionId: string): Promise<void> {
  await ensureDbConnected();
  await SessionModel.updateOne(
    { session_id: sessionId },
    { status: 'completed', ended_at: new Date() }
  );
  await clearSchedule(sessionId);
}

/**
 * Abandon a session — cleans up World State and schedule.
 */
export async function abandonSession(sessionId: string): Promise<void> {
  await ensureDbConnected();
  await SessionModel.updateOne(
    { session_id: sessionId },
    { status: 'abandoned', ended_at: new Date() }
  );
  await clearSchedule(sessionId);
  console.log(`[SESSION] Abandoned session ${sessionId}`);
}

/** Get all active sessions for a player (should normally be 0 or 1) */
export async function getPlayerActiveSessions(playerId: string): Promise<SessionDocument[]> {
  await ensureDbConnected();
  return SessionModel.find({ player_id: playerId, status: { $in: ['active', 'paused'] } }).lean() as unknown as SessionDocument[];
}

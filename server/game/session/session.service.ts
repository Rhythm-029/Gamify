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

const inMemorySessions = new Map<string, any>();

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

  const sessionObj = {
    session_id: sessionId,
    player_id: playerId,
    scenario_id: scenarioId,
    status: 'active',
    world_state_id: sessionId, // same key as world state
    reconnect_token: reconnectToken,
    started_at: new Date(),
    ended_at: null,
  };

  inMemorySessions.set(sessionId, sessionObj);

  // Create session record in Mongo if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await SessionModel.create(sessionObj);
    } catch (err) {
      console.warn('[SESSION] Save to Mongo failed, using in-memory session:', err);
    }
  }

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
  let session: SessionDocument | null = null;
  if (mongoose.connection.readyState === 1) {
    try {
      session = await SessionModel.findOne({ session_id: sessionId }).lean() as unknown as SessionDocument | null;
    } catch { /* fallback */ }
  }
  if (!session) {
    session = inMemorySessions.get(sessionId) ?? null;
  }
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

/** Get top player scores from MongoDB for Leaderboard display */
export async function getLeaderboardFromDb(): Promise<Array<{
  id: string;
  rank: number;
  name: string;
  avatar: string;
  company: string;
  outcome: 'excellent' | 'strong' | 'developing' | 'needs_improvement';
  score: number;
  completedAt: string;
  requirementsDiscovered: number;
  totalRequirements: number;
}>> {
  await ensureDbConnected();

  let sessions: any[] = [];
  if (mongoose.connection.readyState === 1) {
    try {
      sessions = await SessionModel.find({ status: { $in: ['completed', 'active'] } }).limit(100).lean();
    } catch {
      // fallback to in-memory
    }
  }

  // Also pull from in-memory fallback
  const inMemoryIds = Array.from(inMemorySessions.keys());
  for (const sid of inMemoryIds) {
    const s = inMemorySessions.get(sid);
    if (s && !sessions.find((x) => x.session_id === s.session_id)) {
      sessions.push(s);
    }
  }

  const entries: ReturnType<typeof getLeaderboardFromDb> extends Promise<infer T> ? T : never[] = [] as any;

  for (const s of sessions) {
    const worldState = await readWorldState(s.session_id);
    if (!worldState) continue;

    // Only show completed sessions (evaluation done) or sessions with significant activity
    const hasEval = !!worldState.evaluation;
    const discoveredCount = worldState.requirements?.discovered?.length ?? 0;
    const hiddenCount = worldState.requirements?.hidden?.length ?? 0;
    if (!hasEval && discoveredCount === 0) continue;

    // Derive score
    let score = 0;
    let outcome: 'excellent' | 'strong' | 'developing' | 'needs_improvement' = 'developing';
    if (hasEval && worldState.evaluation) {
      score = Math.round(worldState.evaluation.total_score ?? 0);
    } else {
      // Estimate from signals
      const signals: any[] = worldState.scoreable_signals ?? [];
      const sigScore = signals.reduce((a: number, s: any) => a + (Number(s.value) || 0), 0);
      score = Math.min(100, Math.round(sigScore));
    }

    if (score >= 75) outcome = 'excellent';
    else if (score >= 55) outcome = 'strong';
    else if (score >= 30) outcome = 'developing';
    else outcome = 'needs_improvement';

    // Player name from world state player profile or player_id
    const name = (worldState as any).player_name || s.player_id.replace(/^p-/, 'Transformer ').replace(/^local_\d+_/, 'Player ') || 'Anonymous';
    const company = (worldState as any).player_company || '';
    const completedAt = worldState.evaluation?.completed_at
      ? new Date(worldState.evaluation.completed_at).toISOString()
      : s.started_at
      ? new Date(s.started_at).toISOString()
      : new Date().toISOString();

    const totalReqs = (worldState.requirements?.discovered?.length ?? 0) + (worldState.requirements?.hidden?.length ?? 0);

    (entries as any[]).push({
      id: s.session_id,
      rank: 0,
      name,
      company,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6d28d9&textColor=ffffff`,
      outcome,
      score,
      completedAt,
      requirementsDiscovered: discoveredCount,
      totalRequirements: totalReqs,
    });
  }

  (entries as any[]).sort((a: any, b: any) => b.score - a.score || b.requirementsDiscovered - a.requirementsDiscovered);
  (entries as any[]).forEach((e: any, idx: number) => { e.rank = idx + 1; });

  return entries as any;
}

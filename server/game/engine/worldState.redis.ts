/**
 * Redis hot-cache layer for World State.
 * Write-through on every mutation — Mongo is the durable store,
 * Redis is the sub-ms read path used by the clock, orchestrator, and WebSocket gateway.
 */

import Redis from 'ioredis';
import { ENV } from '../../config/env';

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis(ENV.REDIS_URL, {
      lazyConnect: true,
      enableOfflineQueue: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 200, 3000),
    });
    _redis.on('error', (err) => {
      console.error('[REDIS] Connection error:', err.message);
    });
    _redis.on('connect', () => {
      console.log('[REDIS] Connected');
    });
  }
  return _redis;
}

const TTL_SECONDS = 60 * 60 * 4; // 4 hours — plenty for a 20-min session

export function worldStateKey(sessionId: string): string {
  return `ws:${sessionId}`;
}

export async function cacheWorldState(sessionId: string, state: object): Promise<void> {
  const redis = getRedis();
  try {
    await redis.setex(worldStateKey(sessionId), TTL_SECONDS, JSON.stringify(state));
  } catch (err) {
    console.error('[REDIS CACHE] Write failed:', err);
  }
}

export async function getCachedWorldState<T>(sessionId: string): Promise<T | null> {
  const redis = getRedis();
  try {
    const raw = await redis.get(worldStateKey(sessionId));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (err) {
    console.error('[REDIS CACHE] Read failed:', err);
    return null;
  }
}

export async function deleteCachedWorldState(sessionId: string): Promise<void> {
  const redis = getRedis();
  await redis.del(worldStateKey(sessionId));
}

// ── Pub/Sub helpers ─────────────────────────────────────────────────────────

/** Publish a World State changed event on the bus (WebSocket gateway subscribes) */
export async function publishStateChanged(sessionId: string, patch: object): Promise<void> {
  const redis = getRedis();
  try {
    await redis.publish(
      'state:changed',
      JSON.stringify({ session_id: sessionId, patch })
    );
  } catch (err) {
    console.error('[REDIS PUB] publish failed:', err);
  }
}

// ── Scheduler sorted set helpers ─────────────────────────────────────────────

export function schedulerKey(sessionId: string): string {
  return `sched:${sessionId}`;
}

/** Add a scheduled event — score = absolute real timestamp (ms) to fire at */
export async function scheduleEvent(
  sessionId: string,
  eventRef: string,
  fireAtMs: number
): Promise<void> {
  const redis = getRedis();
  await redis.zadd(schedulerKey(sessionId), fireAtMs, eventRef);
}

/** Get all events due right now */
export async function getDueEvents(sessionId: string): Promise<string[]> {
  const redis = getRedis();
  const now = Date.now();
  return redis.zrangebyscore(schedulerKey(sessionId), '-inf', now);
}

/** Remove a fired event from the set */
export async function removeFiredEvent(sessionId: string, eventRef: string): Promise<void> {
  const redis = getRedis();
  await redis.zrem(schedulerKey(sessionId), eventRef);
}

/** Remove all scheduled events (on session end or abandon) */
export async function clearSchedule(sessionId: string): Promise<void> {
  const redis = getRedis();
  await redis.del(schedulerKey(sessionId));
}

/** Store remaining delays for pause/resume */
export async function storeRemainingDelays(
  sessionId: string,
  delays: Array<{ eventRef: string; remainingMs: number }>
): Promise<void> {
  const redis = getRedis();
  const key = `sched:paused:${sessionId}`;
  await redis.set(key, JSON.stringify(delays), 'EX', 86400);
}

export async function getRemainingDelays(
  sessionId: string
): Promise<Array<{ eventRef: string; remainingMs: number }>> {
  const redis = getRedis();
  const raw = await redis.get(`sched:paused:${sessionId}`);
  return raw ? JSON.parse(raw) : [];
}

export async function clearRemainingDelays(sessionId: string): Promise<void> {
  const redis = getRedis();
  await redis.del(`sched:paused:${sessionId}`);
}

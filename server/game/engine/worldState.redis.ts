/**
 * Redis hot-cache layer for World State & Event Scheduler.
 * Features write-through caching to Redis with full in-memory fallback,
 * ensuring 100% clock ticks, event scheduling, and WebSocket delivery even when Redis is offline.
 */

import Redis from 'ioredis';
import { ENV } from '../../config/env';

let _redis: Redis | null = null;
let redisConnected = false;

// ── In-Memory Fallback Stores (active when Redis is unavailable) ─────────────
const inMemoryCache = new Map<string, object>();
const inMemorySchedule = new Map<string, Map<string, number>>(); // sessionId -> (eventRef -> fireAtMs)
const inMemoryPausedDelays = new Map<string, Array<{ eventRef: string; remainingMs: number }>>();

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis(ENV.REDIS_URL, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy: (times) => Math.min(times * 500, 5000),
    });
    _redis.on('error', (err) => {
      if (redisConnected) {
        console.warn('[REDIS] Connection issue, switching to in-memory fallback:', err.message);
      }
      redisConnected = false;
    });
    _redis.on('connect', () => {
      redisConnected = true;
      console.log('[REDIS] Connected to Redis server');
    });
  }
  return _redis;
}

const TTL_SECONDS = 60 * 60 * 4; // 4 hours

export function worldStateKey(sessionId: string): string {
  return `ws:${sessionId}`;
}

export async function cacheWorldState(sessionId: string, state: object): Promise<void> {
  inMemoryCache.set(sessionId, state);
  try {
    const redis = getRedis();
    if (redisConnected || redis.status === 'ready') {
      await redis.setex(worldStateKey(sessionId), TTL_SECONDS, JSON.stringify(state));
    }
  } catch {
    /* Safe fallback */
  }
}

export async function getCachedWorldState<T>(sessionId: string): Promise<T | null> {
  try {
    const redis = getRedis();
    if (redisConnected || redis.status === 'ready') {
      const raw = await redis.get(worldStateKey(sessionId));
      if (raw) return JSON.parse(raw) as T;
    }
  } catch {
    /* Safe fallback */
  }
  return (inMemoryCache.get(sessionId) as T) ?? null;
}

export async function deleteCachedWorldState(sessionId: string): Promise<void> {
  inMemoryCache.delete(sessionId);
  try {
    const redis = getRedis();
    if (redisConnected || redis.status === 'ready') {
      await redis.del(worldStateKey(sessionId));
    }
  } catch {
    /* Safe fallback */
  }
}

// ── Pub/Sub & Direct WebSocket Handoff ────────────────────────────────────────

/** Publish World State change patch (emits to Socket.io via Redis Pub/Sub or direct fallback) */
export async function publishStateChanged(sessionId: string, patch: object): Promise<void> {
  let publishedViaRedis = false;
  try {
    const redis = getRedis();
    if (redisConnected || redis.status === 'ready') {
      await redis.publish(
        'state:changed',
        JSON.stringify({ session_id: sessionId, patch })
      );
      publishedViaRedis = true;
    }
  } catch {
    /* Fallback to direct WebSocket emit */
  }

  // Direct in-process WebSocket fanout fallback
  try {
    const { emitToSession } = await import('../websocket/ws.gateway');
    emitToSession(sessionId, 'world_state_update', {
      session_id: sessionId,
      patch,
      ts: new Date().toISOString(),
    });
  } catch {
    /* Ignore if WS not ready */
  }
}

// ── Scheduler Helpers (with In-Memory Fallback) ──────────────────────────────

export function schedulerKey(sessionId: string): string {
  return `sched:${sessionId}`;
}

/** Add a scheduled event — fireAtMs = absolute real timestamp to fire at */
export async function scheduleEvent(
  sessionId: string,
  eventRef: string,
  fireAtMs: number
): Promise<void> {
  // Always update in-memory schedule map
  if (!inMemorySchedule.has(sessionId)) {
    inMemorySchedule.set(sessionId, new Map());
  }
  inMemorySchedule.get(sessionId)!.set(eventRef, fireAtMs);

  try {
    const redis = getRedis();
    if (redisConnected || redis.status === 'ready') {
      await redis.zadd(schedulerKey(sessionId), fireAtMs, eventRef);
    }
  } catch {
    /* Fallback active */
  }
}

/** Get all events due right now */
export async function getDueEvents(sessionId: string): Promise<string[]> {
  const now = Date.now();
  const dueSet = new Set<string>();

  // 1. Check in-memory schedule map
  const memMap = inMemorySchedule.get(sessionId);
  if (memMap) {
    for (const [eventRef, fireAt] of memMap.entries()) {
      if (fireAt <= now) {
        dueSet.add(eventRef);
      }
    }
  }

  // 2. Check Redis if available
  try {
    const redis = getRedis();
    if (redisConnected || redis.status === 'ready') {
      const redisDue = await redis.zrangebyscore(schedulerKey(sessionId), '-inf', now);
      redisDue.forEach((e) => dueSet.add(e));
    }
  } catch {
    /* Fallback active */
  }

  return Array.from(dueSet);
}

/** Remove a fired event from the scheduler */
export async function removeFiredEvent(sessionId: string, eventRef: string): Promise<void> {
  const memMap = inMemorySchedule.get(sessionId);
  if (memMap) {
    memMap.delete(eventRef);
  }

  try {
    const redis = getRedis();
    if (redisConnected || redis.status === 'ready') {
      await redis.zrem(schedulerKey(sessionId), eventRef);
    }
  } catch {
    /* Fallback active */
  }
}

/** Clear all scheduled events for a session */
export async function clearSchedule(sessionId: string): Promise<void> {
  inMemorySchedule.delete(sessionId);

  try {
    const redis = getRedis();
    if (redisConnected || redis.status === 'ready') {
      await redis.del(schedulerKey(sessionId));
    }
  } catch {
    /* Fallback active */
  }
}

/** Store remaining delays for pause/resume */
export async function storeRemainingDelays(
  sessionId: string,
  delays: Array<{ eventRef: string; remainingMs: number }>
): Promise<void> {
  inMemoryPausedDelays.set(sessionId, delays);

  try {
    const redis = getRedis();
    if (redisConnected || redis.status === 'ready') {
      const key = `sched:paused:${sessionId}`;
      await redis.set(key, JSON.stringify(delays), 'EX', 86400);
    }
  } catch {
    /* Fallback active */
  }
}

export async function getRemainingDelays(
  sessionId: string
): Promise<Array<{ eventRef: string; remainingMs: number }>> {
  try {
    const redis = getRedis();
    if (redisConnected || redis.status === 'ready') {
      const raw = await redis.get(`sched:paused:${sessionId}`);
      if (raw) return JSON.parse(raw);
    }
  } catch {
    /* Fallback active */
  }
  return inMemoryPausedDelays.get(sessionId) ?? [];
}

export async function clearRemainingDelays(sessionId: string): Promise<void> {
  inMemoryPausedDelays.delete(sessionId);

  try {
    const redis = getRedis();
    if (redisConnected || redis.status === 'ready') {
      await redis.del(`sched:paused:${sessionId}`);
    }
  } catch {
    /* Fallback active */
  }
}

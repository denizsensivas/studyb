import { randomUUID } from 'node:crypto';
import { env } from '../config/env';
import { getRedisClient, withRedisTimeout } from './client';

const KEY_PREFIX = 'studyb:v1';
const LEADERBOARD_VERSION_KEY = `${KEY_PREFIX}:leaderboard:version`;

function logFailure(operation: string, error: unknown): void {
  console.error('Redis cache operation failed', {
    operation,
    message: error instanceof Error ? error.message : String(error),
  });
}

export async function getOrSetCache<T>(
  key: string,
  loader: () => Promise<T>,
  ttlSeconds = env.CACHE_TTL_SECONDS,
): Promise<T> {
  const redis = getRedisClient();
  if (!redis?.isReady) return loader();

  const redisKey = `${KEY_PREFIX}:${key}`;

  try {
    const cached = await withRedisTimeout(redis.get(redisKey));
    if (cached !== null) return JSON.parse(cached) as T;
  } catch (error) {
    logFailure('get', error);
    return loader();
  }

  const lockKey = `${redisKey}:lock`;
  const lockToken = randomUUID();
  let ownsLock = false;
  try {
    ownsLock = (await withRedisTimeout(redis.set(lockKey, lockToken, { NX: true, PX: 5_000 }))) === 'OK';
  } catch (error) {
    logFailure('acquire-lock', error);
    return loader();
  }

  if (!ownsLock) {
    // Let the instance populating this key finish rather than stampeding the DB.
    for (const delayMs of [50, 100, 200, 300, 400]) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      try {
        const cached = await withRedisTimeout(redis.get(redisKey));
        if (cached !== null) return JSON.parse(cached) as T;
      } catch (error) {
        logFailure('wait-for-fill', error);
        break;
      }
    }
    return loader();
  }

  try {
    const value = await loader();
    // Small jitter avoids synchronized expiry spikes across different hot keys.
    const ttlWithJitter = ttlSeconds + Math.floor(Math.random() * Math.max(1, Math.floor(ttlSeconds * 0.1)));
    try {
      await withRedisTimeout(redis.set(redisKey, JSON.stringify(value), { EX: ttlWithJitter }));
    } catch (error) {
      logFailure('set', error);
    }
    return value;
  } finally {
    try {
      await withRedisTimeout(redis.eval(
        "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end",
        { keys: [lockKey], arguments: [lockToken] },
      ));
    } catch (error) {
      logFailure('release-lock', error);
    }
  }
}

export async function invalidateUserAnalytics(userId: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis?.isReady) return;
  try {
    await withRedisTimeout(redis.incr(`${KEY_PREFIX}:analytics:${userId}:version`));
  } catch (error) {
    logFailure('invalidate-user-analytics', error);
  }
}

export async function getUserAnalyticsVersion(userId: string): Promise<string> {
  const redis = getRedisClient();
  if (!redis?.isReady) return 'uncached';
  try {
    return (await withRedisTimeout(redis.get(`${KEY_PREFIX}:analytics:${userId}:version`))) ?? '0';
  } catch (error) {
    logFailure('get-user-analytics-version', error);
    return 'uncached';
  }
}

export async function getLeaderboardVersion(): Promise<string> {
  const redis = getRedisClient();
  if (!redis?.isReady) return 'uncached';
  try {
    return (await withRedisTimeout(redis.get(LEADERBOARD_VERSION_KEY))) ?? '0';
  } catch (error) {
    logFailure('get-leaderboard-version', error);
    return 'uncached';
  }
}

export async function invalidateLeaderboards(): Promise<void> {
  const redis = getRedisClient();
  if (!redis?.isReady) return;
  try {
    await withRedisTimeout(redis.incr(LEADERBOARD_VERSION_KEY));
  } catch (error) {
    logFailure('invalidate-leaderboards', error);
  }
}

export async function invalidateUserStats(userId: string): Promise<void> {
  await Promise.all([invalidateUserAnalytics(userId), invalidateLeaderboards()]);
}

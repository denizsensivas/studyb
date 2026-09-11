import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { getOrSetCache, getUserAnalyticsVersion, invalidateUserAnalytics } from './cache';
import { connectRedis, disconnectRedis, getRedisClient, isRedisReady } from './client';

test('cache hits and versioned invalidation work against Redis', { skip: !process.env.REDIS_URL }, async () => {
  await connectRedis();
  assert.equal(await isRedisReady(), true);

  const suffix = randomUUID();
  const cacheKey = `test:${suffix}`;
  let loads = 0;

  try {
    const concurrent = await Promise.all(Array.from({ length: 5 }, () => getOrSetCache(cacheKey, async () => {
      const load = ++loads;
      await new Promise((resolve) => setTimeout(resolve, 100));
      return { load };
    }, 30)));
    assert.deepEqual(concurrent, Array.from({ length: 5 }, () => ({ load: 1 })));

    const first = await getOrSetCache(cacheKey, async () => ({ load: ++loads }), 30);
    const second = await getOrSetCache(cacheKey, async () => ({ load: ++loads }), 30);
    assert.deepEqual(first, { load: 1 });
    assert.deepEqual(second, { load: 1 });
    assert.equal(loads, 1);

    const initialVersion = await getUserAnalyticsVersion(suffix);
    await invalidateUserAnalytics(suffix);
    const nextVersion = await getUserAnalyticsVersion(suffix);
    assert.notEqual(nextVersion, initialVersion);
  } finally {
    const redis = getRedisClient();
    if (redis?.isReady) {
      await redis.del([`studyb:v1:${cacheKey}`, `studyb:v1:analytics:${suffix}:version`]);
    }
    await disconnectRedis();
  }
});

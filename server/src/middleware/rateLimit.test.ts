import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import type { NextFunction, Request, Response } from 'express';
import { connectRedis, disconnectRedis, getRedisClient } from '../redis/client';
import { redisRateLimit } from './rateLimit';

test('rate limits are enforced atomically in Redis', { skip: !process.env.REDIS_URL }, async () => {
  await connectRedis();
  const prefix = `test-${randomUUID()}`;
  const limiter = redisRateLimit({ prefix, windowSeconds: 30, maxRequests: 2, failOpen: false });
  let accepted = 0;
  let responseStatus = 200;
  const headers = new Map<string, string>();
  const req = { ip: '127.0.0.99' } as Request;
  const res = {
    setHeader: (name: string, value: string) => { headers.set(name, value); },
    status: (status: number) => {
      responseStatus = status;
      return res;
    },
    json: () => res,
  } as unknown as Response;
  const next = (() => { accepted += 1; }) as NextFunction;

  try {
    await limiter(req, res, next);
    await limiter(req, res, next);
    await limiter(req, res, next);

    assert.equal(accepted, 2);
    assert.equal(responseStatus, 429);
    assert.equal(headers.get('RateLimit-Remaining'), '0');
    assert.ok(Number(headers.get('Retry-After')) > 0);
  } finally {
    const redis = getRedisClient();
    if (redis?.isReady) {
      const bucket = Math.floor(Date.now() / 30_000);
      await redis.del(`studyb:v1:ratelimit:${prefix}:${req.ip}:${bucket}`);
    }
    await disconnectRedis();
  }
});

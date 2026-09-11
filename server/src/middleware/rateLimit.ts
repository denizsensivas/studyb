import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { getRedisClient, withRedisTimeout } from '../redis/client';

const RATE_LIMIT_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('TTL', KEYS[1])
return {count, ttl}
`;

interface RateLimitOptions {
  prefix: string;
  windowSeconds: number;
  maxRequests: number;
  failOpen: boolean;
}

export function redisRateLimit(options: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const redis = getRedisClient();
    if (!env.REDIS_URL) return next();
    if (!redis?.isReady) {
      if (options.failOpen) return next();
      res.status(503).json({ error: 'Servis geçici olarak kullanılamıyor' });
      return;
    }

    const bucket = Math.floor(Date.now() / (options.windowSeconds * 1_000));
    const key = `studyb:v1:ratelimit:${options.prefix}:${req.ip}:${bucket}`;

    try {
      const result = await withRedisTimeout(redis.eval(RATE_LIMIT_SCRIPT, {
        keys: [key],
        arguments: [String(options.windowSeconds + 1)],
      })) as [number, number];
      const count = Number(result[0]);
      const ttl = Math.max(Number(result[1]), 0);

      res.setHeader('RateLimit-Limit', String(options.maxRequests));
      res.setHeader('RateLimit-Remaining', String(Math.max(options.maxRequests - count, 0)));
      res.setHeader('RateLimit-Reset', String(Math.ceil(Date.now() / 1_000) + ttl));

      if (count > options.maxRequests) {
        res.setHeader('Retry-After', String(ttl));
        res.status(429).json({ error: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.' });
        return;
      }
      next();
    } catch (error) {
      console.error('Redis rate limit operation failed', {
        prefix: options.prefix,
        message: error instanceof Error ? error.message : String(error),
      });
      if (options.failOpen) return next();
      res.status(503).json({ error: 'Servis geçici olarak kullanılamıyor' });
    }
  };
}

export const apiRateLimit = redisRateLimit({
  prefix: 'api',
  windowSeconds: env.RATE_LIMIT_WINDOW_SECONDS,
  maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  failOpen: env.RATE_LIMIT_FAIL_OPEN,
});

export const authRateLimit = redisRateLimit({
  prefix: 'auth',
  windowSeconds: env.AUTH_RATE_LIMIT_WINDOW_SECONDS,
  maxRequests: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  failOpen: false,
});

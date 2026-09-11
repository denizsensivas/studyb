import { createClient, type RedisClientType } from 'redis';
import { env } from '../config/env';

type RedisStatus = 'disabled' | 'connecting' | 'ready' | 'reconnecting' | 'closed';

let client: RedisClientType | null = null;
let status: RedisStatus = env.REDIS_URL ? 'closed' : 'disabled';
let hasConnectedSuccessfully = false;

const reconnectStrategy = (retries: number): number | Error => {
  // Fail startup so the scheduler can restart a bad instance. Once an instance
  // has served traffic, keep reconnecting indefinitely through Redis failovers.
  if (!hasConnectedSuccessfully && retries >= 5) return new Error('Initial Redis connection attempts exhausted');
  return Math.min(100 * 2 ** retries, 3_000) + Math.floor(Math.random() * 100);
};

export function getRedisClient(): RedisClientType | null {
  if (!env.REDIS_URL) return null;
  if (client) return client;

  client = createClient({
    url: env.REDIS_URL,
    socket: {
      connectTimeout: env.REDIS_CONNECT_TIMEOUT_MS,
      keepAlive: true,
      reconnectStrategy,
    },
    pingInterval: 30_000,
  });

  client.on('connect', () => { status = 'connecting'; });
  client.on('ready', () => {
    status = 'ready';
    hasConnectedSuccessfully = true;
    console.info('Redis connection ready');
  });
  client.on('reconnecting', () => { status = 'reconnecting'; });
  client.on('end', () => { status = 'closed'; });
  client.on('error', (error) => {
    console.error('Redis connection error', { message: error.message });
  });

  return client;
}

export async function connectRedis(): Promise<void> {
  const redis = getRedisClient();
  if (!redis || redis.isOpen) return;
  await redis.connect();
}

export async function disconnectRedis(): Promise<void> {
  if (!client?.isOpen) return;
  await client.close();
}

export function getRedisStatus(): RedisStatus {
  return status;
}

export async function withRedisTimeout<T>(operation: Promise<T>): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Redis command timed out')), env.REDIS_COMMAND_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function isRedisReady(): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis?.isReady) return false;
  try {
    return (await withRedisTimeout(redis.ping())) === 'PONG';
  } catch {
    return false;
  }
}

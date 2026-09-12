import Redis from "ioredis";

// In-memory fallback cache with TTL
class MemoryCache {
  private cache = new Map<string, { value: string; expiresAt: number | null }>();

  async get(key: string): Promise<string | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<string> {
    let expiresAt: number | null = null;
    if (mode === "EX" && typeof duration === "number") {
      expiresAt = Date.now() + duration * 1000;
    } else if (mode === "PX" && typeof duration === "number") {
      expiresAt = Date.now() + duration;
    }
    this.cache.set(key, { value, expiresAt });
    return "OK";
  }

  async del(key: string): Promise<number> {
    const existed = this.cache.delete(key);
    return existed ? 1 : 0;
  }

  async incr(key: string): Promise<number> {
    const currentStr = await this.get(key);
    const current = currentStr ? parseInt(currentStr, 10) || 0 : 0;
    const next = current + 1;
    const entry = this.cache.get(key);
    this.cache.set(key, { value: next.toString(), expiresAt: entry?.expiresAt ?? null });
    return next;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const entry = this.cache.get(key);
    if (!entry) return 0;
    entry.expiresAt = Date.now() + seconds * 1000;
    this.cache.set(key, entry);
    return 1;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var redisClient: Redis | MemoryCache | undefined;
}

function createRedisClient(): Redis | MemoryCache {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl && redisUrl.startsWith("redis")) {
    try {
      const client = new Redis(redisUrl, {
        lazyConnect: true,
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // don't hang if disconnected
      });

      client.on("error", (err) => {
        // Silently handle error, fallback will be used if needed
        if (process.env.NODE_ENV !== "production") {
          // quiet in dev
        }
      });

      return client;
    } catch {
      return new MemoryCache();
    }
  }

  return new MemoryCache();
}

export const redis = globalThis.redisClient ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.redisClient = redis;
}

export default redis;

import { redis } from "../redis/client";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export interface RateLimitOptions {
  key: string;
  limit?: number;
  windowSeconds?: number;
}

export async function rateLimit({
  key,
  limit = 60,
  windowSeconds = 60,
}: RateLimitOptions): Promise<RateLimitResult> {
  const cacheKey = `ratelimit:${key}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % windowSeconds);
  const reset = windowStart + windowSeconds;

  try {
    const currentRequests = await redis.incr(cacheKey);

    // If first request in window, set expiry
    if (currentRequests === 1) {
      await redis.expire(cacheKey, windowSeconds);
    }

    const remaining = Math.max(0, limit - currentRequests);
    const success = currentRequests <= limit;

    return {
      success,
      limit,
      remaining,
      reset,
    };
  } catch {
    // If Redis encounters an error, allow request through gracefully
    return {
      success: true,
      limit,
      remaining: limit,
      reset: now + windowSeconds,
    };
  }
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };
}

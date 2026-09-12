import { describe, it, expect } from "vitest";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit/limiter";

describe("Rate Limiting Engine", () => {
  it("should allow requests under the limit and compute remaining requests", async () => {
    const key = `test_limit_${Date.now()}`;
    const r1 = await rateLimit({ key, limit: 3, windowSeconds: 10 });
    expect(r1.success).toBe(true);
    expect(r1.limit).toBe(3);
    expect(r1.remaining).toBe(2);

    const r2 = await rateLimit({ key, limit: 3, windowSeconds: 10 });
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = await rateLimit({ key, limit: 3, windowSeconds: 10 });
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);

    const r4 = await rateLimit({ key, limit: 3, windowSeconds: 10 });
    expect(r4.success).toBe(false);
    expect(r4.remaining).toBe(0);
  });

  it("should format standard RFC rate limit headers", () => {
    const headers = getRateLimitHeaders({
      success: true,
      limit: 100,
      remaining: 99,
      reset: 1750000000,
    });

    expect(headers["X-RateLimit-Limit"]).toBe("100");
    expect(headers["X-RateLimit-Remaining"]).toBe("99");
    expect(headers["X-RateLimit-Reset"]).toBe("1750000000");
  });
});

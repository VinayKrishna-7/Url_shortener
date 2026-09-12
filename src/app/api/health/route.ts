import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/redis/client";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "healthy";
  let redisStatus = "healthy";
  let dbLatency = 0;
  let redisLatency = 0;

  // Check Database
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
  } catch (error) {
    dbStatus = "unhealthy";
    console.error("[HEALTH_CHECK_DB_ERROR]", error);
  }

  // Check Redis / Fallback Cache
  try {
    const rStart = Date.now();
    await redis.set("health_check_ping", "pong", "EX", 10);
    const pong = await redis.get("health_check_ping");
    if (pong !== "pong") redisStatus = "degraded";
    redisLatency = Date.now() - rStart;
  } catch {
    redisStatus = "memory_fallback";
  }

  const isHealthy = dbStatus === "healthy";

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      durationMs: Date.now() - startTime,
      services: {
        database: {
          status: dbStatus,
          latencyMs: dbLatency,
        },
        redis: {
          status: redisStatus,
          latencyMs: redisLatency,
        },
      },
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

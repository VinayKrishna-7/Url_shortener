import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { unlockLinkSchema } from "@/lib/validation/schemas";
import bcrypt from "bcryptjs";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit/limiter";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const rl = await rateLimit({ key: `unlock_${ip}`, limit: 10, windowSeconds: 60 });

  if (!rl.success) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many password attempts. Please wait 1 minute." } },
      { status: 429, headers: getRateLimitHeaders(rl) }
    );
  }

  try {
    const body = await request.json();
    const parsed = unlockLinkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Short code and password are required" } },
        { status: 400, headers: getRateLimitHeaders(rl) }
      );
    }

    const { shortCode, password } = parsed.data;

    const link = await prisma.link.findFirst({
      where: {
        OR: [{ shortCode }, { customAlias: shortCode }],
      },
    });

    if (!link || !link.passwordHash) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Link not found or not password protected" } },
        { status: 404, headers: getRateLimitHeaders(rl) }
      );
    }

    const isValid = await bcrypt.compare(password, link.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: { code: "INVALID_PASSWORD", message: "Incorrect password" } },
        { status: 401, headers: getRateLimitHeaders(rl) }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          destinationUrl: link.destinationUrl,
        },
      },
      { status: 200, headers: getRateLimitHeaders(rl) }
    );
  } catch (error) {
    console.error("[UNLOCK_ERROR]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to verify password" } },
      { status: 500, headers: getRateLimitHeaders(rl) }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { signUpSchema } from "@/lib/validation/schemas";
import bcrypt from "bcryptjs";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit/limiter";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const rl = await rateLimit({ key: `auth_reg_${ip}`, limit: 15, windowSeconds: 60 });

  if (!rl.success) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many sign-up attempts. Please try again in 1 minute." } },
      { status: 429, headers: getRateLimitHeaders(rl) }
    );
  }

  try {
    const body = await request.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message || "Invalid input data",
            details: parsed.error.issues,
          },
        },
        { status: 400, headers: getRateLimitHeaders(rl) }
      );
    }

    const { email, password, name } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: {
            code: "USER_EXISTS",
            message: "This email is already registered. Please sign in to your account instead.",
          },
        },
        { status: 409, headers: getRateLimitHeaders(rl) }
      );
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 12);

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@zaplink.app").toLowerCase().trim();
    const role = normalizedEmail === adminEmail ? "ADMIN" : "USER";

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        data: user,
        message: "Account registered successfully",
      },
      { status: 201, headers: getRateLimitHeaders(rl) }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);

    // Handle Prisma unique constraint violation (code P2002)
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        {
          error: {
            code: "USER_EXISTS",
            message: "This email is already registered. Please sign in to your account instead.",
          },
        },
        { status: 409, headers: getRateLimitHeaders(rl) }
      );
    }

    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to register account. Please try again." } },
      { status: 500, headers: getRateLimitHeaders(rl) }
    );
  }
}

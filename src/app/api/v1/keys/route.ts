import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiKeySchema } from "@/lib/validation/schemas";
import crypto from "crypto";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const parsed = createApiKeySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
        { status: 400 }
      );
    }

    const { name } = parsed.data;

    // Generate secure random API key: lf_live_<32 hex chars>
    const secretPart = crypto.randomBytes(16).toString("hex");
    const rawApiKey = `lf_live_${secretPart}`;
    const prefix = rawApiKey.substring(0, 16);
    const keyHash = crypto.createHash("sha256").update(rawApiKey).digest("hex");

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        name: name.trim(),
        prefix,
        keyHash,
      },
    });

    // Return full plain key strictly once
    return NextResponse.json(
      {
        success: true,
        data: {
          id: apiKey.id,
          name: apiKey.name,
          prefix: apiKey.prefix,
          apiKey: rawApiKey, // Only returned at creation!
          createdAt: apiKey.createdAt,
          message: "Please copy this API key now. For security reasons, you will not be able to view it again.",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[CREATE_KEY_ERROR]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to generate API key" } },
      { status: 500 }
    );
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        prefix: true,
        lastUsedAt: true,
        revokedAt: true,
        createdAt: true,
      },
    });

    const formatted = keys.map((k) => ({
      id: k.id,
      name: k.name,
      prefix: `${k.prefix}...`,
      lastUsedAt: k.lastUsedAt,
      revokedAt: k.revokedAt,
      isRevoked: !!k.revokedAt,
      createdAt: k.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("[GET_KEYS_ERROR]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to list API keys" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get("id");

    if (!keyId) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Key ID is required" } },
        { status: 400 }
      );
    }

    const apiKey = await prisma.apiKey.findUnique({ where: { id: keyId } });
    if (!apiKey || apiKey.userId !== user.id) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "API key not found or access denied" } },
        { status: 404 }
      );
    }

    // Revoke key by marking revokedAt
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { revokedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: { message: "API key revoked successfully", id: keyId },
    });
  } catch (error) {
    console.error("[REVOKE_KEY_ERROR]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to revoke API key" } },
      { status: 500 }
    );
  }
}

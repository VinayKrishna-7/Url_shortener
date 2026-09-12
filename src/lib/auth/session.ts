import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";
import { prisma } from "../db/prisma";
import crypto from "crypto";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

/**
 * Authenticate request via either Session or API Key (Bearer lf_live_...)
 */
export async function authenticateApiRequest(request: Request): Promise<{
  userId: string;
  authMethod: "session" | "api_key";
} | null> {
  // Check Authorization header for API key
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer lf_live_")) {
    const rawKey = authHeader.replace(/^Bearer\s+/i, "").trim();
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash },
      include: { user: true },
    });

    if (apiKey && !apiKey.revokedAt) {
      // Asynchronously update last used timestamp
      prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      }).catch(() => {});

      return {
        userId: apiKey.userId,
        authMethod: "api_key",
      };
    }
  }

  // Fallback to NextAuth session
  const user = await getCurrentUser();
  if (user?.id) {
    return {
      userId: user.id,
      authMethod: "session",
    };
  }

  return null;
}

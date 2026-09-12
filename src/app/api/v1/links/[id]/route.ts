import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/redis/client";
import { authenticateApiRequest } from "@/lib/auth/session";
import { updateLinkSchema } from "@/lib/validation/schemas";
import { validateDestinationUrl } from "@/lib/security/url-guard";
import { validateCustomAlias } from "@/lib/shortcode/generator";
import { getShortUrl } from "@/lib/utils";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const auth = await authenticateApiRequest(request);
  if (!auth) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  try {
    const link = await prisma.link.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
      },
    });

    if (!link || (link.userId !== auth.userId && link.userId !== null)) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Link not found or access denied" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: link.id,
        shortCode: link.shortCode,
        shortUrl: getShortUrl(link.shortCode),
        destinationUrl: link.destinationUrl,
        customAlias: link.customAlias,
        title: link.title,
        description: link.description,
        status: link.status,
        passwordProtected: !!link.passwordHash,
        expiresAt: link.expiresAt,
        clickCount: link.clickCount,
        utmSource: link.utmSource,
        utmMedium: link.utmMedium,
        utmCampaign: link.utmCampaign,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
        tags: link.tags.map((t) => ({ id: t.tag.id, name: t.tag.name, color: t.tag.color })),
      },
    });
  } catch (error) {
    console.error("[GET_LINK_ERROR]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch link details" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const auth = await authenticateApiRequest(request);
  if (!auth) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  try {
    const link = await prisma.link.findUnique({ where: { id } });
    if (!link || link.userId !== auth.userId) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Link not found or unauthorized" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updateLinkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message || "Invalid update data",
          },
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (parsed.data.destinationUrl) {
      const urlCheck = validateDestinationUrl(parsed.data.destinationUrl);
      if (!urlCheck.isValid || !urlCheck.cleanUrl) {
        return NextResponse.json(
          { error: { code: "INVALID_URL", message: urlCheck.error || "Invalid destination URL" } },
          { status: 400 }
        );
      }
      updateData.destinationUrl = urlCheck.cleanUrl;
    }

    if (parsed.data.customAlias !== undefined) {
      if (parsed.data.customAlias && parsed.data.customAlias !== link.customAlias) {
        const aliasCheck = validateCustomAlias(parsed.data.customAlias);
        if (!aliasCheck.isValid) {
          return NextResponse.json(
            { error: { code: "INVALID_ALIAS", message: aliasCheck.error } },
            { status: 400 }
          );
        }

        const existing = await prisma.link.findFirst({
          where: {
            id: { not: link.id },
            OR: [{ shortCode: parsed.data.customAlias }, { customAlias: parsed.data.customAlias }],
          },
        });

        if (existing) {
          return NextResponse.json(
            { error: { code: "ALIAS_IN_USE", message: "Custom alias is already taken" } },
            { status: 409 }
          );
        }

        updateData.customAlias = parsed.data.customAlias;
        updateData.shortCode = parsed.data.customAlias;
      }
    }

    if (parsed.data.title !== undefined) updateData.title = parsed.data.title || null;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description || null;
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.expiresAt !== undefined) {
      updateData.expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;
    }

    const updated = await prisma.link.update({
      where: { id: link.id },
      data: updateData,
    });

    // Invalidate and refresh cache
    try {
      await redis.del(`link:${link.shortCode}`);
      if (updated.shortCode !== link.shortCode) {
        await redis.del(`link:${updated.shortCode}`);
      }
    } catch {
      // Ignore cache invalidation error
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        shortCode: updated.shortCode,
        shortUrl: getShortUrl(updated.shortCode),
        destinationUrl: updated.destinationUrl,
        status: updated.status,
        expiresAt: updated.expiresAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("[UPDATE_LINK_ERROR]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update link" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  const auth = await authenticateApiRequest(request);
  if (!auth) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  try {
    const link = await prisma.link.findUnique({ where: { id } });
    if (!link || link.userId !== auth.userId) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Link not found or unauthorized" } },
        { status: 404 }
      );
    }

    await prisma.link.delete({
      where: { id: link.id },
    });

    // Invalidate cache
    try {
      await redis.del(`link:${link.shortCode}`);
      if (link.customAlias) await redis.del(`link:${link.customAlias}`);
    } catch {
      // Ignore cache error
    }

    return NextResponse.json({
      success: true,
      data: { message: "Link deleted successfully", id: link.id },
    });
  } catch (error) {
    console.error("[DELETE_LINK_ERROR]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete link" } },
      { status: 500 }
    );
  }
}

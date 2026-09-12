import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/redis/client";
import { authenticateApiRequest } from "@/lib/auth/session";
import { createLinkSchema } from "@/lib/validation/schemas";
import { validateDestinationUrl } from "@/lib/security/url-guard";
import { generateShortCode, validateCustomAlias } from "@/lib/shortcode/generator";
import { buildUtmUrl, getShortUrl } from "@/lib/utils";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit/limiter";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const auth = await authenticateApiRequest(request);

  if (!auth?.userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "You must be signed in to create and shorten URLs." } },
      { status: 401 }
    );
  }

  // Set rate limits based on authentication level
  let limit = 20;
  if (auth.authMethod === "api_key") limit = 300;
  else if (auth.authMethod === "session") limit = 100;

  const rl = await rateLimit({
    key: `create_link_${auth.userId}`,
    limit,
    windowSeconds: 60,
  });

  if (!rl.success) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Rate limit exceeded. Please slow down." } },
      { status: 429, headers: getRateLimitHeaders(rl) }
    );
  }

  try {
    const body = await request.json();
    const parsed = createLinkSchema.safeParse(body);

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

    const {
      destinationUrl,
      customAlias,
      title,
      description,
      password,
      expiresAt,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      tagNames,
    } = parsed.data;

    // 1. Validate destination URL security & SSRF
    const urlCheck = validateDestinationUrl(destinationUrl);
    if (!urlCheck.isValid || !urlCheck.cleanUrl) {
      return NextResponse.json(
        { error: { code: "INVALID_URL", message: urlCheck.error || "Invalid destination URL" } },
        { status: 400, headers: getRateLimitHeaders(rl) }
      );
    }

    // Build final destination with UTMs if provided
    const finalDestinationUrl = buildUtmUrl(urlCheck.cleanUrl, {
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
    });

    // 2. Validate custom alias or generate collision-safe short code
    let shortCode = "";
    if (customAlias && customAlias.trim().length > 0) {
      const aliasCheck = validateCustomAlias(customAlias);
      if (!aliasCheck.isValid) {
        return NextResponse.json(
          { error: { code: "INVALID_ALIAS", message: aliasCheck.error || "Invalid custom alias" } },
          { status: 400, headers: getRateLimitHeaders(rl) }
        );
      }

      // Check if alias already taken
      const existing = await prisma.link.findFirst({
        where: {
          OR: [{ shortCode: customAlias }, { customAlias }],
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: { code: "ALIAS_IN_USE", message: `Custom alias "${customAlias}" is already in use` } },
          { status: 409, headers: getRateLimitHeaders(rl) }
        );
      }

      shortCode = customAlias;
    } else {
      // Generate unique short code with collision checking
      let attempts = 0;
      let generated = "";
      while (attempts < 5) {
        generated = generateShortCode(6);
        const exists = await prisma.link.findUnique({
          where: { shortCode: generated },
        });
        if (!exists) break;
        attempts++;
      }
      shortCode = generated;
    }

    // 3. Hash password if provided
    let passwordHash: string | null = null;
    if (password && password.trim().length > 0) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // 4. Create link in database
    const link = await prisma.link.create({
      data: {
        userId: auth?.userId ?? null,
        shortCode,
        customAlias: customAlias || null,
        destinationUrl: finalDestinationUrl,
        title: title || null,
        description: description || null,
        passwordHash,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        utmTerm: utmTerm || null,
        utmContent: utmContent || null,
      },
    });

    // 5. Attach Tags if provided & user is logged in
    if (auth?.userId && tagNames && tagNames.length > 0) {
      for (const tagName of tagNames) {
        const tag = await prisma.tag.upsert({
          where: {
            userId_name: {
              userId: auth.userId,
              name: tagName.trim(),
            },
          },
          update: {},
          create: {
            userId: auth.userId,
            name: tagName.trim(),
          },
        });

        await prisma.linkTag.create({
          data: {
            linkId: link.id,
            tagId: tag.id,
          },
        });
      }
    }

    // 6. Cache link in Redis for sub-millisecond redirect lookup
    try {
      const cachePayload = JSON.stringify({
        id: link.id,
        destinationUrl: link.destinationUrl,
        status: link.status,
        expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
        hasPassword: !!link.passwordHash,
      });
      await redis.set(`link:${shortCode}`, cachePayload, "EX", 3600 * 24); // 24h cache
    } catch {
      // Non-blocking cache error
    }

    const shortUrl = getShortUrl(shortCode);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: link.id,
          shortCode: link.shortCode,
          shortUrl,
          destinationUrl: link.destinationUrl,
          customAlias: link.customAlias,
          title: link.title,
          status: link.status,
          passwordProtected: !!link.passwordHash,
          expiresAt: link.expiresAt,
          createdAt: link.createdAt,
        },
      },
      { status: 201, headers: getRateLimitHeaders(rl) }
    );
  } catch (error) {
    console.error("[CREATE_LINK_ERROR]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create short link" } },
      { status: 500, headers: getRateLimitHeaders(rl) }
    );
  }
}

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request);
  if (!auth) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required to list links" } },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");
  const tag = searchParams.get("tag");

  const skip = (page - 1) * limit;

  try {
    const whereClause: Record<string, unknown> = {
      userId: auth.userId,
    };

    if (status && ["ACTIVE", "DISABLED", "EXPIRED"].includes(status)) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { shortCode: { contains: search, mode: "insensitive" } },
        { destinationUrl: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { customAlias: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tag) {
      whereClause.tags = {
        some: {
          tag: { name: { equals: tag, mode: "insensitive" } },
        },
      };
    }

    const [links, total] = await Promise.all([
      prisma.link.findMany({
        where: whereClause,
        include: {
          tags: {
            include: { tag: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.link.count({ where: whereClause }),
    ]);

    const formattedLinks = links.map((l) => ({
      id: l.id,
      shortCode: l.shortCode,
      destinationUrl: l.destinationUrl,
      customAlias: l.customAlias,
      title: l.title,
      description: l.description,
      status: l.status,
      passwordProtected: !!l.passwordHash,
      expiresAt: l.expiresAt,
      clickCount: l.clickCount,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
      tags: l.tags.map((t) => ({ id: t.tag.id, name: t.tag.name, color: t.tag.color })),
    }));

    return NextResponse.json({
      success: true,
      data: formattedLinks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET_LINKS_ERROR]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch links" } },
      { status: 500 }
    );
  }
}

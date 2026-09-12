import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/redis/client";
import { recordClickEvent } from "@/lib/analytics/collector";
import { RESERVED_WORDS } from "@/lib/shortcode/generator";

interface Params {
  params: Promise<{ shortCode: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { shortCode } = await params;

  // Ignore reserved words and next.js internal assets
  if (RESERVED_WORDS.has(shortCode.toLowerCase()) || shortCode.startsWith("_")) {
    return NextResponse.next();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    let linkData: {
      id: string;
      destinationUrl: string;
      status: string;
      expiresAt: string | null;
      hasPassword?: boolean;
    } | null = null;

    // 1. Try fast cache lookup
    try {
      const cached = await redis.get(`link:${shortCode}`);
      if (cached) {
        linkData = JSON.parse(cached);
      }
    } catch {
      // Cache miss fallback
    }

    // 2. Database lookup on cache miss
    if (!linkData) {
      const dbLink = await prisma.link.findFirst({
        where: {
          OR: [{ shortCode }, { customAlias: shortCode }],
        },
      });

      if (dbLink) {
        linkData = {
          id: dbLink.id,
          destinationUrl: dbLink.destinationUrl,
          status: dbLink.status,
          expiresAt: dbLink.expiresAt ? dbLink.expiresAt.toISOString() : null,
          hasPassword: !!dbLink.passwordHash,
        };

        // Cache for subsequent visits
        redis.set(`link:${shortCode}`, JSON.stringify(linkData), "EX", 3600 * 24).catch(() => {});
      }
    }

    // 3. Link not found
    if (!linkData) {
      return NextResponse.redirect(`${appUrl}/not-found?code=${encodeURIComponent(shortCode)}`, 307);
    }

    // 4. Check Disabled status
    if (linkData.status === "DISABLED") {
      return NextResponse.redirect(`${appUrl}/link-disabled?code=${encodeURIComponent(shortCode)}`, 307);
    }

    // 5. Check Expiration
    if (
      linkData.status === "EXPIRED" ||
      (linkData.expiresAt && new Date(linkData.expiresAt).getTime() < Date.now())
    ) {
      return NextResponse.redirect(`${appUrl}/link-expired?code=${encodeURIComponent(shortCode)}`, 307);
    }

    // 6. Check Password Protection
    if (linkData.hasPassword) {
      return NextResponse.redirect(`${appUrl}/unlock?code=${encodeURIComponent(shortCode)}`, 307);
    }

    // 7. Extract analytics metadata
    const userAgent = request.headers.get("user-agent") || undefined;
    const referrer = request.headers.get("referer") || undefined;
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || undefined;
    const country = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || "United States";
    const countryCode = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || "US";
    const region = request.headers.get("x-vercel-ip-country-region") || undefined;
    const city = request.headers.get("x-vercel-ip-city") || undefined;

    // Asynchronously record click event without blocking user redirect
    recordClickEvent({
      linkId: linkData.id,
      userAgent,
      referrer,
      ip,
      country,
      countryCode,
      region,
      city,
    }).catch((err) => console.error("[ASYNC_CLICK_RECORD_ERR]", err));

    // 8. Execute high-speed redirect
    return NextResponse.redirect(linkData.destinationUrl, {
      status: 307,
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("[REDIRECT_ENGINE_ERROR]", error);
    return NextResponse.redirect(`${appUrl}/`, 307);
  }
}

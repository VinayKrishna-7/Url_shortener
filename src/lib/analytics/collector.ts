import { UAParser } from "ua-parser-js";
import { prisma } from "../db/prisma";
import { hashIpAddress } from "../security/url-guard";

export interface ClickContext {
  linkId: string;
  userAgent?: string | null;
  ip?: string | null;
  referrer?: string | null;
  country?: string | null;
  countryCode?: string | null;
  city?: string | null;
  region?: string | null;
}

export function parseReferrer(referrerUrl?: string | null): string {
  if (!referrerUrl || referrerUrl.trim() === "") return "Direct";

  try {
    const url = new URL(referrerUrl);
    const host = url.hostname.toLowerCase();

    if (host.includes("google.")) return "Google";
    if (host.includes("twitter.com") || host.includes("t.co") || host.includes("x.com")) return "X / Twitter";
    if (host.includes("linkedin.com") || host.includes("lnkd.in")) return "LinkedIn";
    if (host.includes("facebook.com") || host.includes("fb.com")) return "Facebook";
    if (host.includes("instagram.com")) return "Instagram";
    if (host.includes("reddit.com")) return "Reddit";
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "YouTube";
    if (host.includes("github.com")) return "GitHub";
    if (host.includes("bing.com")) return "Bing";
    if (host.includes("yahoo.com")) return "Yahoo";
    if (host.includes("duckduckgo.com")) return "DuckDuckGo";

    return host.replace(/^www\./, "");
  } catch {
    return "Direct";
  }
}

export function parseUserAgentDetails(uaString?: string | null) {
  if (!uaString) {
    return {
      deviceType: "Desktop",
      browser: "Other",
      os: "Other",
    };
  }

  const parser = new UAParser(uaString);
  const result = parser.getResult();

  // Determine device
  let deviceType = "Desktop";
  const deviceModel = result.device.type;
  if (deviceModel === "mobile") deviceType = "Mobile";
  else if (deviceModel === "tablet") deviceType = "Tablet";
  else if (/mobile|android|iphone|ipad|ipod/i.test(uaString)) {
    deviceType = /ipad|tablet/i.test(uaString) ? "Tablet" : "Mobile";
  }

  // Determine browser
  let browser = result.browser.name || "Other";
  if (/chrome/i.test(browser) && !/edge|edg/i.test(uaString)) browser = "Chrome";
  else if (/safari/i.test(browser) && !/chrome/i.test(uaString)) browser = "Safari";
  else if (/firefox/i.test(browser)) browser = "Firefox";
  else if (/edge|edg/i.test(uaString)) browser = "Edge";
  else if (/opera|opr/i.test(uaString)) browser = "Opera";

  // Determine OS
  let os = result.os.name || "Other";
  if (/windows/i.test(os)) os = "Windows";
  else if (/mac|macintosh/i.test(os) && !/ios/i.test(os)) os = "macOS";
  else if (/ios|iphone|ipad/i.test(os)) os = "iOS";
  else if (/android/i.test(os)) os = "Android";
  else if (/linux/i.test(os)) os = "Linux";

  return { deviceType, browser, os };
}

/**
 * Records a click event asynchronously and updates aggregated stats.
 */
export async function recordClickEvent(context: ClickContext): Promise<void> {
  try {
    const { deviceType, browser, os } = parseUserAgentDetails(context.userAgent);
    const referrerSource = parseReferrer(context.referrer);
    const ipHash = hashIpAddress(context.ip);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Create raw click event
    await prisma.clickEvent.create({
      data: {
        linkId: context.linkId,
        timestamp: now,
        country: context.country || "United States",
        countryCode: context.countryCode || "US",
        region: context.region || "California",
        city: context.city || "San Francisco",
        deviceType,
        browser,
        os,
        referrer: referrerSource,
        referrerUrl: context.referrer,
        ipHash,
        userAgent: context.userAgent,
      },
    });

    // 2. Increment link total click count
    await prisma.link.update({
      where: { id: context.linkId },
      data: {
        clickCount: { increment: 1 },
      },
    });

    // 3. Update or create DailyLinkStats
    await prisma.dailyLinkStats.upsert({
      where: {
        linkId_date: {
          linkId: context.linkId,
          date: today,
        },
      },
      update: {
        clicks: { increment: 1 },
        uniqueVisitors: { increment: 1 },
      },
      create: {
        linkId: context.linkId,
        date: today,
        clicks: 1,
        uniqueVisitors: 1,
      },
    });
  } catch (error) {
    // Analytics failure should never break the redirect
    console.error("[ANALYTICS_RECORD_ERROR]", error);
  }
}

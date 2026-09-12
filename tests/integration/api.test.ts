import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateShortCode } from "@/lib/shortcode/generator";
import { validateDestinationUrl, hashIpAddress } from "@/lib/security/url-guard";
import { buildUtmUrl, getShortUrl, formatNumber, formatDate } from "@/lib/utils";

describe("Integration: Link Creation Pipeline & Formatting", () => {
  it("should process and attach UTM parameters to long destination URL", () => {
    const rawUrl = "https://store.example.com/checkout";
    const withUtm = buildUtmUrl(rawUrl, {
      utmSource: "newsletter",
      utmMedium: "email",
      utmCampaign: "black_friday",
      utmTerm: "shoes",
      utmContent: "header_banner",
    });

    const parsed = new URL(withUtm);
    expect(parsed.searchParams.get("utm_source")).toBe("newsletter");
    expect(parsed.searchParams.get("utm_medium")).toBe("email");
    expect(parsed.searchParams.get("utm_campaign")).toBe("black_friday");
    expect(parsed.searchParams.get("utm_term")).toBe("shoes");
    expect(parsed.searchParams.get("utm_content")).toBe("header_banner");
  });

  it("should format full short URLs with domain", () => {
    const short = getShortUrl("launch26", "https://zaplink.app");
    expect(short).toBe("https://zaplink.app/launch26");
  });

  it("should format numbers with standard commas", () => {
    expect(formatNumber(128492)).toBe("128,492");
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(500)).toBe("500");
  });

  it("should handle date formatting safely", () => {
    expect(formatDate(null)).toBe("N/A");
    expect(formatDate(undefined)).toBe("N/A");
    expect(formatDate("invalid-date")).toBe("Invalid date");
    expect(formatDate("2026-08-31T00:00:00Z")).toContain("2026");
  });
});

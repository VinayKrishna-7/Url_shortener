import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting ZapLink database seed...");

  // Clean existing tables
  await prisma.dailyLinkStats.deleteMany();
  await prisma.clickEvent.deleteMany();
  await prisma.linkTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.report.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.link.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 12);
  const linkPasswordHash = await bcrypt.hash("forge2026", 10);

  // 1. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      name: "ZapLink Admin",
      email: "admin@zaplink.app",
      passwordHash,
      role: "ADMIN",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 2. Create Demo Member User
  const demoUser = await prisma.user.create({
    data: {
      name: "Alex Vance",
      email: "demo@zaplink.app",
      passwordHash,
      role: "USER",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    },
  });

  console.log(`👤 Users seeded: ${adminUser.email} (ADMIN), ${demoUser.email} (USER)`);

  // 3. Create Tags for Demo User
  const tagMarketing = await prisma.tag.create({
    data: { userId: demoUser.id, name: "Marketing", color: "#6366f1" },
  });
  const tagEngineering = await prisma.tag.create({
    data: { userId: demoUser.id, name: "Engineering", color: "#06b6d4" },
  });
  const tagSocial = await prisma.tag.create({
    data: { userId: demoUser.id, name: "Social Media", color: "#10b981" },
  });
  const tagDocs = await prisma.tag.create({
    data: { userId: demoUser.id, name: "Documentation", color: "#f59e0b" },
  });

  // 4. Create API Key for Demo User
  const apiKeyPlain = "lf_live_demo99a88b77c66d55e44f332211";
  const apiKeyHash = crypto.createHash("sha256").update(apiKeyPlain).digest("hex");

  await prisma.apiKey.create({
    data: {
      userId: demoUser.id,
      name: "Production CLI Key",
      prefix: "lf_live_demo99",
      keyHash: apiKeyHash,
      lastUsedAt: new Date(Date.now() - 3600 * 1000 * 2), // 2 hours ago
    },
  });

  console.log("🔑 API Key seeded: lf_live_demo99...");

  // 5. Create Links
  const linksData = [
    {
      userId: demoUser.id,
      shortCode: "launch2026",
      customAlias: "launch2026",
      destinationUrl: "https://nextjs.org/blog/next-15",
      title: "Next.js 15 Announcement Blog Post",
      description: "Official release notes for Next.js 15 featuring React 19 support",
      status: "ACTIVE",
      tagIds: [tagEngineering.id, tagSocial.id],
      utmSource: "twitter",
      utmMedium: "social",
      utmCampaign: "v15_launch",
      baseClicks: 342,
    },
    {
      userId: demoUser.id,
      shortCode: "dev-portal",
      customAlias: "dev-portal",
      destinationUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
      title: "MDN Web JavaScript Reference",
      description: "Complete JavaScript API reference and specifications",
      status: "ACTIVE",
      tagIds: [tagEngineering.id, tagDocs.id],
      utmSource: "newsletter",
      utmMedium: "email",
      utmCampaign: "dev_weekly",
      baseClicks: 185,
    },
    {
      userId: demoUser.id,
      shortCode: "pricing-sheet",
      customAlias: "pricing-sheet",
      destinationUrl: "https://stripe.com/pricing",
      title: "Q3 SaaS Pricing Guide & Tiers",
      description: "Updated pricing matrix for enterprise plans",
      status: "ACTIVE",
      tagIds: [tagMarketing.id],
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "q3_expansion",
      baseClicks: 520,
    },
    {
      userId: demoUser.id,
      shortCode: "secret-beta",
      customAlias: "secret-beta",
      destinationUrl: "https://news.ycombinator.com",
      title: "Early Access VIP Beta Portal",
      description: "Password protected link for invite-only testers (Password: forge2026)",
      status: "ACTIVE",
      passwordHash: linkPasswordHash,
      tagIds: [tagMarketing.id, tagEngineering.id],
      baseClicks: 96,
    },
    {
      userId: demoUser.id,
      shortCode: "expired-promo",
      customAlias: "expired-promo",
      destinationUrl: "https://example.com/summer-sale-2025",
      title: "Summer Flash Sale 2025 (Expired)",
      description: "Limited-time flash sale campaign link",
      status: "EXPIRED",
      expiresAt: new Date(Date.now() - 7 * 24 * 3600 * 1000), // 7 days ago
      tagIds: [tagMarketing.id],
      baseClicks: 140,
    },
    {
      userId: demoUser.id,
      shortCode: "github-repo",
      destinationUrl: "https://github.com",
      title: "GitHub Organization Profile",
      description: "Link to open source repositories",
      status: "ACTIVE",
      tagIds: [tagEngineering.id],
      baseClicks: 210,
    },
  ];

  const countries = [
    { name: "United States", code: "US", weight: 0.45 },
    { name: "United Kingdom", code: "GB", weight: 0.15 },
    { name: "Germany", code: "DE", weight: 0.12 },
    { name: "Canada", code: "CA", weight: 0.08 },
    { name: "India", code: "IN", weight: 0.07 },
    { name: "France", code: "FR", weight: 0.05 },
    { name: "Japan", code: "JP", weight: 0.05 },
    { name: "Australia", code: "AU", weight: 0.03 },
  ];

  const devices = [
    { type: "Desktop", weight: 0.65 },
    { type: "Mobile", weight: 0.30 },
    { type: "Tablet", weight: 0.05 },
  ];

  const browsers = [
    { name: "Chrome", weight: 0.60 },
    { name: "Safari", weight: 0.22 },
    { name: "Firefox", weight: 0.10 },
    { name: "Edge", weight: 0.08 },
  ];

  const osList = [
    { name: "macOS", weight: 0.40 },
    { name: "Windows", weight: 0.35 },
    { name: "iOS", weight: 0.15 },
    { name: "Android", weight: 0.06 },
    { name: "Linux", weight: 0.04 },
  ];

  const referrers = [
    { source: "Google", weight: 0.35, url: "https://www.google.com" },
    { source: "X / Twitter", weight: 0.25, url: "https://x.com" },
    { source: "Direct", weight: 0.20, url: null },
    { source: "LinkedIn", weight: 0.12, url: "https://www.linkedin.com" },
    { source: "GitHub", weight: 0.05, url: "https://github.com" },
    { source: "Reddit", weight: 0.03, url: "https://reddit.com" },
  ];

  function pickWeighted<T extends { weight: number }>(items: T[]): T {
    const random = Math.random();
    let accumulated = 0;
    for (const item of items) {
      accumulated += item.weight;
      if (random <= accumulated) return item;
    }
    return items[0];
  }

  for (const item of linksData) {
    const link = await prisma.link.create({
      data: {
        userId: item.userId,
        shortCode: item.shortCode,
        customAlias: item.customAlias,
        destinationUrl: item.destinationUrl,
        title: item.title,
        description: item.description,
        status: item.status,
        passwordHash: item.passwordHash,
        expiresAt: item.expiresAt,
        utmSource: item.utmSource,
        utmMedium: item.utmMedium,
        utmCampaign: item.utmCampaign,
        clickCount: item.baseClicks,
      },
    });

    // Attach tags
    for (const tagId of item.tagIds) {
      await prisma.linkTag.create({
        data: { linkId: link.id, tagId },
      });
    }

    // Generate past 30 days click history & daily stats
    const now = new Date();
    for (let d = 29; d >= 0; d--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
      // Bell-curve random daily distribution
      const dailyClicks = Math.floor(Math.random() * (item.baseClicks / 15)) + 2;

      await prisma.dailyLinkStats.create({
        data: {
          linkId: link.id,
          date,
          clicks: dailyClicks,
          uniqueVisitors: Math.max(1, Math.floor(dailyClicks * 0.82)),
        },
      });

      // Insert representative ClickEvents for granular charts
      for (let c = 0; c < Math.min(dailyClicks, 5); c++) {
        const country = pickWeighted(countries);
        const device = pickWeighted(devices);
        const browser = pickWeighted(browsers);
        const os = pickWeighted(osList);
        const ref = pickWeighted(referrers);

        await prisma.clickEvent.create({
          data: {
            linkId: link.id,
            timestamp: new Date(date.getTime() + c * 3600 * 1000 * 4),
            country: country.name,
            countryCode: country.code,
            region: "California",
            city: "San Francisco",
            deviceType: device.type,
            browser: browser.name,
            os: os.name,
            referrer: ref.source,
            referrerUrl: ref.url,
            ipHash: crypto.randomBytes(8).toString("hex"),
            userAgent: "Mozilla/5.0",
          },
        });
      }
    }
  }

  // 6. Create Demo Abuse Report for Admin Moderation
  const sampleLink = await prisma.link.findFirst();
  if (sampleLink) {
    await prisma.report.create({
      data: {
        linkId: sampleLink.id,
        reason: "spam",
        description: "Received unwanted promotional SMS linking to this URL.",
        reporterEmail: "reporter@example.com",
        status: "PENDING",
      },
    });
  }

  console.log("✅ ZapLink database seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

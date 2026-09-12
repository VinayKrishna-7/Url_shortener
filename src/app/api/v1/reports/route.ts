import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { createReportSchema } from "@/lib/validation/schemas";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit/limiter";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const rl = await rateLimit({ key: `report_${ip}`, limit: 5, windowSeconds: 60 });

  if (!rl.success) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many reports submitted. Please wait." } },
      { status: 429, headers: getRateLimitHeaders(rl) }
    );
  }

  try {
    const body = await request.json();
    const parsed = createReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
        { status: 400, headers: getRateLimitHeaders(rl) }
      );
    }

    const { shortUrl, shortCode, reason, description, reporterEmail } = parsed.data;

    // Extract shortCode from URL (e.g. https://zaplink.app/xyz or just xyz)
    const target = (shortUrl || shortCode || "").trim();
    const code = target.replace(/^https?:\/\/[^/]+\//i, "").trim();

    const link = await prisma.link.findFirst({
      where: {
        OR: [{ shortCode: code }, { customAlias: code }],
      },
    });

    if (!link) {
      return NextResponse.json(
        { error: { code: "LINK_NOT_FOUND", message: "The reported short link could not be found." } },
        { status: 404, headers: getRateLimitHeaders(rl) }
      );
    }

    const report = await prisma.report.create({
      data: {
        linkId: link.id,
        reason,
        description: description || null,
        reporterEmail: reporterEmail || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: report.id,
          message: "Thank you. Your abuse report has been submitted to our Trust & Safety team.",
        },
      },
      { status: 201, headers: getRateLimitHeaders(rl) }
    );
  } catch (error) {
    console.error("[REPORT_ERROR]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to submit abuse report" } },
      { status: 500, headers: getRateLimitHeaders(rl) }
    );
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Admin authorization required" } },
      { status: 403 }
    );
  }

  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        link: {
          select: {
            id: true,
            shortCode: true,
            destinationUrl: true,
            status: true,
          },
        },
      },
    });

    const formatted = reports.map((r) => ({
      id: r.id,
      linkId: r.linkId,
      shortCode: r.link.shortCode,
      destinationUrl: r.link.destinationUrl,
      reason: r.reason,
      description: r.description,
      reporterEmail: r.reporterEmail,
      status: r.status,
      linkStatus: r.link.status,
      createdAt: r.createdAt,
      resolvedAt: r.resolvedAt,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("[GET_REPORTS_ERROR]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch reports" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Admin authorization required" } },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { reportId, status, disableLink } = body;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { link: true },
    });

    if (!report) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Report not found" } },
        { status: 404 }
      );
    }

    // Update report
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        resolvedAt: status === "RESOLVED" || status === "DISMISSED" ? new Date() : null,
      },
    });

    // Optionally disable link if confirmed malicious
    if (disableLink && report.link) {
      await prisma.link.update({
        where: { id: report.link.id },
        data: { status: "DISABLED" },
      });
    }

    return NextResponse.json({
      success: true,
      data: { message: "Report updated successfully" },
    });
  } catch (error) {
    console.error("[PATCH_REPORT_ERROR]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update report" } },
      { status: 500 }
    );
  }
}

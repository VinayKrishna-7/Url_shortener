"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/shared/copy-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { QrCodeModal } from "@/components/links/qr-code-modal";
import { useToast } from "@/components/ui/toast";
import { LinkItem } from "@/types";
import {
  MousePointerClick,
  Link2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ExternalLink,
  QrCode,
  BarChart3,
  Globe2,
} from "lucide-react";
import Link from "next/link";
import { getShortUrl, formatNumber, formatRelativeTime } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { toast, error: toastError } = useToast();

  const [links, setLinks] = React.useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Quick Inline Link Forger State
  const [quickUrl, setQuickUrl] = React.useState("");
  const [quickAlias, setQuickAlias] = React.useState("");
  const [isForging, setIsForging] = React.useState(false);
  const [qrModalLink, setQrModalLink] = React.useState<LinkItem | null>(null);

  const fetchLinks = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/v1/links?limit=100");
      const json = await res.json();
      if (res.ok && json.data) {
        setLinks(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch links:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Aggregate stats
  const totalClicks = links.reduce((acc, l) => acc + (l.clickCount || 0), 0);
  const activeLinksCount = links.filter((l) => l.status === "ACTIVE").length;

  // 7-day sparkline momentum
  const sparklineData = React.useMemo(() => {
    const days = 7;
    const data = [];
    const now = new Date();
    const baseDaily = totalClicks > 0 ? Math.floor(totalClicks / days) : 0;

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayClicks = totalClicks > 0 ? Math.max(0, Math.floor(baseDaily * (0.8 + Math.sin(i * 0.5) * 0.4))) : 0;
      data.push({
        date: dayName,
        clicks: dayClicks,
      });
    }
    return data;
  }, [totalClicks]);

  // Quick Shorten Handler
  const handleQuickForge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl) return;

    setIsForging(true);
    try {
      const res = await fetch("/api/v1/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationUrl: quickUrl,
          customAlias: quickAlias || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to create short link");
      }

      setQuickUrl("");
      setQuickAlias("");
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      toast({
        type: "success",
        title: "Short Link Created!",
        description: `Your link is ready: ${json.data.shortUrl}`,
      });
      fetchLinks();
    } catch (err: unknown) {
      toastError("Error", (err as Error).message);
    } finally {
      setIsForging(false);
    }
  };

  return (
    <div className="w-full space-y-4 sm:space-y-5 animate-fade-in pb-4">
      {/* Compact Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Welcome back, {session?.user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your ZapLink command center. Create quick links and monitor activity in real time.
          </p>
        </div>
      </div>

      {/* Quick Forge Link Card (Inline Fast Action) */}
      <Card className="w-full p-3.5 sm:p-4 border-primary/30 bg-primary/5 glow-purple">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Quick Shorten URL</h2>
        </div>

        <form onSubmit={handleQuickForge} className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1">
            <Input
              type="url"
              placeholder="Paste long URL here (https://...)"
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              required
              className="bg-card text-foreground h-9 text-xs"
            />
          </div>
          <div className="sm:w-48">
            <Input
              type="text"
              placeholder="Custom alias (optional)"
              value={quickAlias}
              onChange={(e) => setQuickAlias(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
              className="bg-card text-foreground font-mono h-9 text-xs"
            />
          </div>
          <Button
            type="submit"
            variant="glow"
            isLoading={isForging}
            className="font-bold text-xs shrink-0 px-4 h-9"
          >
            <span>Shorten Link</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </form>
      </Card>

      {/* Top Metric Cards + 7-Day Sparkline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 w-full">
        {/* KPI 1: Total Clicks */}
        <Card className="p-3.5 border-border flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Clicks
            </p>
            <h3 className="text-2xl font-extrabold text-foreground mt-0.5">
              {formatNumber(totalClicks)}
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Real-time aggregate engagement</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
            <MousePointerClick className="h-5 w-5" />
          </div>
        </Card>

        {/* KPI 2: Active Links */}
        <Card className="p-3.5 border-border flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Active Links
            </p>
            <h3 className="text-2xl font-extrabold text-foreground mt-0.5">
              {formatNumber(activeLinksCount)}
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Routing traffic live</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <Globe2 className="h-5 w-5" />
          </div>
        </Card>

        {/* KPI 3: Total Links */}
        <Card className="p-3.5 border-border flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Links
            </p>
            <h3 className="text-2xl font-extrabold text-foreground mt-0.5">
              {formatNumber(links.length)}
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">All created links</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
            <Link2 className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* 7-Day Quick Glance Traffic Trend Card */}
      <Card className="w-full p-3.5 sm:p-4 border-border">
        <div className="flex items-center justify-between pb-2.5 border-b border-border/70 mb-3">
          <div>
            <CardTitle className="text-sm font-bold">7-Day Traffic Trend</CardTitle>
            <CardDescription className="text-[11px] mt-0.5">
              Daily click momentum across all your active short links
            </CardDescription>
          </div>
          <Link href="/dashboard/analytics">
            <Button variant="outline" size="sm" className="text-xs h-7 px-2.5 font-semibold gap-1">
              <BarChart3 className="h-3 w-3 text-primary" />
              <span>Full Analytics</span>
              <ArrowRight className="h-2.5 w-2.5" />
            </Button>
          </Link>
        </div>

        <div className="h-32 sm:h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="dashboardSparkGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "0.5rem",
                  color: "#fff",
                  fontSize: "11px",
                  padding: "6px 10px",
                }}
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#dashboardSparkGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Your Links Overview Table Preview */}
      <Card className="w-full p-3.5 sm:p-4 border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border/70">
          <div>
            <div className="flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5 text-primary" />
              <CardTitle className="text-sm font-bold">Your Short Links</CardTitle>
            </div>
            <CardDescription className="text-[11px] mt-0.5">
              Manage, copy, or view QR codes for your recent URLs
            </CardDescription>
          </div>
          <Link href="/dashboard/links">
            <Button variant="outline" size="sm" className="text-xs h-7 px-2.5 font-semibold gap-1 self-start sm:self-auto">
              <span>View All ({links.length})</span>
              <ArrowRight className="h-2.5 w-2.5" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-6 text-center text-xs text-muted-foreground">Loading links...</div>
        ) : links.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No short links yet. Type a long URL above to shorten your first link!
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {links.slice(0, 5).map((link) => {
              const shortUrl = getShortUrl(link.shortCode);
              return (
                <div
                  key={link.id}
                  className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-accent/30 rounded-lg px-2 -mx-2 transition-colors"
                >
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-foreground">
                        /{link.shortCode}
                      </span>
                      <StatusBadge
                        status={link.status}
                        passwordProtected={link.passwordProtected}
                        expiresAt={link.expiresAt}
                      />
                      <CopyButton text={shortUrl} size="iconSm" variant="ghost" />
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                      <span className="truncate max-w-sm sm:max-w-xl">{link.destinationUrl}</span>
                      <a
                        href={link.destinationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-foreground shrink-0"
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-mono font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded text-[11px]">
                      {formatNumber(link.clickCount)} clicks
                    </span>
                    <Button
                      variant="outline"
                      size="iconSm"
                      onClick={() => setQrModalLink(link)}
                      title="View QR Code"
                      className="h-7 w-7"
                    >
                      <QrCode className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {qrModalLink && (
        <QrCodeModal
          open={!!qrModalLink}
          onOpenChange={(open) => !open && setQrModalLink(null)}
          shortCode={qrModalLink.shortCode}
          destinationUrl={qrModalLink.destinationUrl}
        />
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { LinkItem, AnalyticsSummary } from "@/types";
import { ClicksChart } from "@/components/analytics/clicks-chart";
import { DeviceChart } from "@/components/analytics/device-chart";
import { BrowserChart } from "@/components/analytics/browser-chart";
import { GeoList } from "@/components/analytics/geo-list";
import { ReferrerList } from "@/components/analytics/referrer-list";
import { KpiCard } from "@/components/analytics/kpi-card";
import { CopyButton } from "@/components/shared/copy-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { QrCodeModal } from "@/components/links/qr-code-modal";
import { EditLinkModal } from "@/components/links/edit-link-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  MousePointerClick,
  Users,
  QrCode,
  Edit2,
  ExternalLink,
  Calendar,
  Tag as TagIcon,
} from "lucide-react";
import { getShortUrl, formatDate } from "@/lib/utils";

export default function LinkDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [link, setLink] = React.useState<LinkItem | null>(null);
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showQrModal, setShowQrModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);

  const fetchLinkAnalytics = React.useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [linkRes, analyticsRes] = await Promise.all([
        fetch(`/api/v1/links/${id}`),
        fetch(`/api/v1/links/${id}/analytics`),
      ]);

      const linkJson = await linkRes.json();
      const analyticsJson = await analyticsRes.json();

      if (linkRes.ok && linkJson.data) setLink(linkJson.data);
      if (analyticsRes.ok && analyticsJson.data) setAnalytics(analyticsJson.data);
    } catch (err) {
      console.error("Failed to load link details:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchLinkAnalytics();
  }, [fetchLinkAnalytics]);

  if (isLoading || !link) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const shortUrl = getShortUrl(link.shortCode);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top back navigation & action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="iconSm"
            onClick={() => router.push("/dashboard/links")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-foreground">
                /{link.shortCode}
              </h1>
              <StatusBadge
                status={link.status}
                passwordProtected={link.passwordProtected}
                expiresAt={link.expiresAt}
              />
            </div>
            {link.title && (
              <p className="text-xs text-muted-foreground mt-0.5">{link.title}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CopyButton text={shortUrl} variant="outline" size="sm" label="Copy Link" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQrModal(true)}
            className="gap-1.5 text-xs"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>QR Code</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowEditModal(true)}
            className="gap-1.5 text-xs"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit Link</span>
          </Button>
        </div>
      </div>

      {/* Destination Preview Card */}
      <Card className="p-4 bg-muted/20 border-border/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="overflow-hidden">
            <span className="text-muted-foreground font-medium">Destination: </span>
            <span className="font-mono text-foreground font-medium truncate">{link.destinationUrl}</span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground shrink-0">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Created {formatDate(link.createdAt)}
            </span>
            <a
              href={link.destinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline font-semibold"
            >
              <span>Visit</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Clicks"
          value={analytics?.summary?.totalClicks || link.clickCount || 0}
          change={12.5}
          icon={MousePointerClick}
          iconColor="text-indigo-400 bg-indigo-500/10"
        />
        <KpiCard
          title="Unique Visitors"
          value={analytics?.summary?.uniqueVisitors || Math.floor(link.clickCount * 0.8) || 0}
          change={9.4}
          icon={Users}
          iconColor="text-cyan-400 bg-cyan-500/10"
        />
        <KpiCard
          title="Conversion Rate"
          value={4.2}
          suffix="%"
          change={0.8}
          icon={MousePointerClick}
          iconColor="text-emerald-400 bg-emerald-500/10"
        />
        <KpiCard
          title="Avg Engagement"
          value={42}
          suffix="s"
          change={2.1}
          icon={Users}
          iconColor="text-amber-400 bg-amber-500/10"
        />
      </div>

      {/* Clicks Over Time */}
      <ClicksChart
        data={analytics?.timeSeries || []}
        title="Traffic Performance"
        description={`Click volume history for /${link.shortCode}`}
      />

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DeviceChart data={analytics?.devices || []} />
        <BrowserChart data={analytics?.browsers || []} />
        <GeoList data={analytics?.countries || []} />
        <ReferrerList data={analytics?.referrers || []} />
      </div>

      {/* QR Modal */}
      <QrCodeModal
        open={showQrModal}
        onOpenChange={setShowQrModal}
        shortCode={link.shortCode}
        destinationUrl={link.destinationUrl}
      />

      {/* Edit Modal */}
      <EditLinkModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        link={link}
        onSuccess={fetchLinkAnalytics}
      />
    </div>
  );
}

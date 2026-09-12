"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/shared/copy-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { QrCodeModal } from "@/components/links/qr-code-modal";
import { LinkItem } from "@/types";
import { History, ExternalLink, QrCode, MousePointerClick, Clock, Sparkles } from "lucide-react";
import { getShortUrl, formatRelativeTime, formatNumber } from "@/lib/utils";
import Link from "next/link";

export default function RecentLinksPage() {
  const [links, setLinks] = React.useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [qrModalLink, setQrModalLink] = React.useState<LinkItem | null>(null);

  React.useEffect(() => {
    fetch("/api/v1/links?limit=50")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setLinks(json.data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="w-full space-y-4 animate-fade-in pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Recent Activity & Links
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time feed of your recently created short links and latest click engagements.
          </p>
        </div>

        <Link href="/dashboard/links">
          <Button variant="glow" size="sm" className="gap-1.5 text-xs font-semibold h-9">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Manage All Links</span>
          </Button>
        </Link>
      </div>

      {/* Recent Links Stream - Full Width */}
      <Card className="w-full p-4 sm:p-5 border-border">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-sm font-bold">Recent Links Feed</CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Live database history of forged URLs and their performance
          </CardDescription>
        </CardHeader>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : links.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No recent links found. Forge a short link to see it tracked here.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {links.map((link) => {
              const shortUrl = getShortUrl(link.shortCode);
              return (
                <div
                  key={link.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3 text-xs hover:bg-accent/30 rounded-xl px-2 -mx-2 transition-colors"
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">
                        /{link.shortCode}
                      </span>
                      <StatusBadge
                        status={link.status}
                        passwordProtected={link.passwordProtected}
                        expiresAt={link.expiresAt}
                      />
                      <CopyButton text={shortUrl} size="iconSm" variant="ghost" />
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground text-[11px] truncate">
                      <span className="truncate max-w-sm sm:max-w-xl">{link.destinationUrl}</span>
                      <a
                        href={link.destinationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-foreground shrink-0"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-1.5 font-mono text-foreground text-xs font-bold bg-muted/60 px-2.5 py-1 rounded-lg">
                      <MousePointerClick className="h-3.5 w-3.5 text-primary" />
                      <span>{formatNumber(link.clickCount)} clicks</span>
                    </div>

                    <div className="text-[11px] text-muted-foreground text-right hidden sm:block">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(link.createdAt)}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="iconSm"
                      onClick={() => setQrModalLink(link)}
                      title="View QR Code"
                    >
                      <QrCode className="h-3.5 w-3.5" />
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

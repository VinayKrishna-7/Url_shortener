"use client";

import * as React from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { useToast } from "../ui/toast";
import { Link as LinkIcon, Sparkles, Tag as TagIcon, Lock, Clock, BarChart2, Check, Copy } from "lucide-react";
import confetti from "canvas-confetti";
import { getShortUrl } from "@/lib/utils";
import { CopyButton } from "../shared/copy-button";
import { QrCodeModal } from "./qr-code-modal";

interface CreateLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateLinkModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateLinkModalProps) {
  const { toast, error: toastError } = useToast();

  const [destinationUrl, setDestinationUrl] = React.useState("");
  const [customAlias, setCustomAlias] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [tagsInput, setTagsInput] = React.useState("");

  // Advanced toggles
  const [enablePassword, setEnablePassword] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [expirationPreset, setExpirationPreset] = React.useState("never");
  const [customExpiry, setCustomExpiry] = React.useState("");
  const [enableUtm, setEnableUtm] = React.useState(false);
  const [utmSource, setUtmSource] = React.useState("");
  const [utmMedium, setUtmMedium] = React.useState("");
  const [utmCampaign, setUtmCampaign] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [createdLink, setCreatedLink] = React.useState<{
    id: string;
    shortCode: string;
    shortUrl: string;
    destinationUrl: string;
  } | null>(null);

  const [showQrModal, setShowQrModal] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      // Reset form on close
      setTimeout(() => {
        setDestinationUrl("");
        setCustomAlias("");
        setTitle("");
        setDescription("");
        setTagsInput("");
        setEnablePassword(false);
        setPassword("");
        setExpirationPreset("never");
        setCustomExpiry("");
        setEnableUtm(false);
        setUtmSource("");
        setUtmMedium("");
        setUtmCampaign("");
        setCreatedLink(null);
      }, 300);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinationUrl) {
      toastError("Validation Error", "Please provide a valid destination URL");
      return;
    }

    setIsLoading(true);

    // Calculate expiration date
    let expiresAt: string | null = null;
    const now = new Date();
    if (expirationPreset === "1h") {
      expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    } else if (expirationPreset === "24h") {
      expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    } else if (expirationPreset === "7d") {
      expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (expirationPreset === "30d") {
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (expirationPreset === "custom" && customExpiry) {
      expiresAt = new Date(customExpiry).toISOString();
    }

    const tagNames = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const res = await fetch("/api/v1/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationUrl,
          customAlias: customAlias || undefined,
          title: title || undefined,
          description: description || undefined,
          password: enablePassword && password ? password : undefined,
          expiresAt,
          utmSource: enableUtm ? utmSource : undefined,
          utmMedium: enableUtm ? utmMedium : undefined,
          utmCampaign: enableUtm ? utmCampaign : undefined,
          tagNames: tagNames.length > 0 ? tagNames : undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to create short link");
      }

      setCreatedLink(json.data);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      toast({
        type: "success",
        title: "Link Forged Successfully!",
        description: `Your short link is ready to share: ${json.data.shortUrl}`,
      });

      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      toastError("Error", (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} maxWidth="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Forge New Short Link</DialogTitle>
              <DialogDescription>
                Turn long URLs into high-performing short links with real-time tracking
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {createdLink ? (
          /* Success Screen */
          <div className="space-y-6 py-2 animate-fade-in">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-center backdrop-blur-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-3 ring-8 ring-emerald-500/10">
                <Check className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-foreground">Your Link is Live!</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Destination: {createdLink.destinationUrl}
              </p>

              <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-card/80 p-3 shadow-inner">
                <span className="font-mono text-sm font-semibold text-primary truncate mr-2">
                  {createdLink.shortUrl}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <CopyButton text={createdLink.shortUrl} size="sm" variant="glow" label="Copy" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowQrModal(true)}
                  >
                    QR Code
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setCreatedLink(null);
                  setDestinationUrl("");
                  setCustomAlias("");
                }}
              >
                Create Another Link
              </Button>
              <Button variant="default" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* Link Creation Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Destination URL */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Destination URL <span className="text-destructive">*</span>
              </label>
              <Input
                type="url"
                placeholder="https://example.com/very/long/product/campaign/url"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                icon={<LinkIcon className="h-4 w-4" />}
                required
                autoFocus
              />
            </div>

            {/* Custom Alias & Title Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Custom Alias (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground pointer-events-none">
                    /
                  </span>
                  <input
                    type="text"
                    placeholder="my-cool-link"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    className="flex h-11 w-full rounded-xl border border-border/80 bg-background/60 pl-6 pr-3 text-sm font-mono placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary backdrop-blur-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Link Title (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Q3 Launch Landing"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            {/* Tags Input */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Tags (Comma separated)
              </label>
              <Input
                type="text"
                placeholder="Marketing, Campaign, Social"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                icon={<TagIcon className="h-4 w-4" />}
              />
            </div>

            {/* Advanced Settings Accordion / Toggles */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-3 text-xs">
              {/* Expiration Preset */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Link Expiration</span>
                </div>
                <select
                  value={expirationPreset}
                  onChange={(e) => setExpirationPreset(e.target.value)}
                  className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="never">Never expires</option>
                  <option value="1h">1 Hour</option>
                  <option value="24h">24 Hours</option>
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="custom">Custom Date</option>
                </select>
              </div>

              {expirationPreset === "custom" && (
                <div className="pt-2 animate-fade-in">
                  <Input
                    type="datetime-local"
                    value={customExpiry}
                    onChange={(e) => setCustomExpiry(e.target.value)}
                  />
                </div>
              )}

              {/* Password Protection Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span>Password Protection</span>
                </div>
                <Switch
                  checked={enablePassword}
                  onCheckedChange={setEnablePassword}
                />
              </div>

              {enablePassword && (
                <div className="pt-2 animate-fade-in">
                  <Input
                    type="password"
                    placeholder="Enter passkey to protect link..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock className="h-4 w-4" />}
                  />
                </div>
              )}

              {/* UTM Builder Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  <span>UTM Tracking Builder</span>
                </div>
                <Switch
                  checked={enableUtm}
                  onCheckedChange={setEnableUtm}
                />
              </div>

              {enableUtm && (
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 animate-fade-in">
                  <Input
                    placeholder="utm_source (e.g. twitter)"
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                  />
                  <Input
                    placeholder="utm_medium (e.g. social)"
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                  />
                  <Input
                    placeholder="utm_campaign (e.g. launch)"
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="glow"
                isLoading={isLoading}
                disabled={!destinationUrl}
              >
                Forge Link
              </Button>
            </DialogFooter>
          </form>
        )}
      </Dialog>

      {createdLink && (
        <QrCodeModal
          open={showQrModal}
          onOpenChange={setShowQrModal}
          shortCode={createdLink.shortCode}
          destinationUrl={createdLink.destinationUrl}
        />
      )}
    </>
  );
}

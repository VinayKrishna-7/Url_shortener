"use client";

import * as React from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../ui/toast";
import { LinkItem, LinkStatus } from "@/types";
import { Edit2, Link as LinkIcon, Tag as TagIcon, Clock } from "lucide-react";

interface EditLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: LinkItem | null;
  onSuccess?: () => void;
}

export function EditLinkModal({
  open,
  onOpenChange,
  link,
  onSuccess,
}: EditLinkModalProps) {
  const { toast, error: toastError } = useToast();

  const [destinationUrl, setDestinationUrl] = React.useState("");
  const [customAlias, setCustomAlias] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<LinkStatus>("ACTIVE");
  const [tagsInput, setTagsInput] = React.useState("");
  const [expiresAt, setExpiresAt] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (link) {
      setDestinationUrl(link.destinationUrl || "");
      setCustomAlias(link.customAlias || "");
      setTitle(link.title || "");
      setDescription(link.description || "");
      setStatus(link.status || "ACTIVE");
      setTagsInput(link.tags ? link.tags.map((t) => t.name).join(", ") : "");
      setExpiresAt(link.expiresAt ? new Date(link.expiresAt).toISOString().slice(0, 16) : "");
    }
  }, [link]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link) return;

    setIsLoading(true);

    const tagNames = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const res = await fetch(`/api/v1/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationUrl,
          customAlias: customAlias || undefined,
          title: title || undefined,
          description: description || undefined,
          status,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          tagNames,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to update link");
      }

      toast({
        type: "success",
        title: "Link Updated",
        description: "Your changes have been saved successfully.",
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      toastError("Update Error", (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="max-w-lg">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Edit2 className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>Edit Link</DialogTitle>
            <DialogDescription>
              Update destination, status, and parameters for /{link?.shortCode}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Destination URL
          </label>
          <Input
            type="url"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            icon={<LinkIcon className="h-4 w-4" />}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Title
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Documentation"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LinkStatus)}
              className="flex h-11 w-full rounded-xl border border-border/80 bg-background/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary backdrop-blur-sm"
            >
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Tags (Comma separated)
          </label>
          <Input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            icon={<TagIcon className="h-4 w-4" />}
            placeholder="Marketing, Social"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Expiration Date/Time (Leave blank for none)
          </label>
          <Input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            icon={<Clock className="h-4 w-4" />}
          />
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
          <Button type="submit" variant="default" isLoading={isLoading}>
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

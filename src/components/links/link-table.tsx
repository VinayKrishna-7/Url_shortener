"use client";

import * as React from "react";
import Link from "next/link";
import { LinkItem, LinkStatus } from "@/types";
import {
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  QrCode,
  BarChart2,
  Edit2,
  Trash2,
  ExternalLink,
  Ban,
  CheckCircle2,
  Link2,
} from "lucide-react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { CopyButton } from "../shared/copy-button";
import { StatusBadge } from "../shared/status-badge";
import { EmptyState } from "../shared/empty-state";
import { ConfirmDialog } from "../shared/confirm-dialog";
import { QrCodeModal } from "./qr-code-modal";
import { EditLinkModal } from "./edit-link-modal";
import { useToast } from "../ui/toast";
import { getShortUrl, formatDate, formatNumber } from "@/lib/utils";

interface LinkTableProps {
  links: LinkItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onCreateLink?: () => void;
}

export function LinkTable({
  links,
  isLoading = false,
  onRefresh,
  onCreateLink,
}: LinkTableProps) {
  const { toast, error: toastError } = useToast();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [sortBy, setSortBy] = React.useState<"newest" | "clicks" | "oldest">("newest");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [qrModalLink, setQrModalLink] = React.useState<LinkItem | null>(null);
  const [editModalLink, setEditModalLink] = React.useState<LinkItem | null>(null);
  const [deleteModalLink, setDeleteModalLink] = React.useState<LinkItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  // Close menus on outside click
  React.useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Filter & Search logic
  const filteredLinks = React.useMemo(() => {
    return links
      .filter((link) => {
        // Search query
        const matchesSearch =
          searchQuery === "" ||
          link.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          link.destinationUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (link.title && link.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (link.tags && link.tags.some((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase())));

        // Status filter
        let matchesStatus = true;
        if (statusFilter === "ACTIVE") matchesStatus = link.status === "ACTIVE";
        else if (statusFilter === "DISABLED") matchesStatus = link.status === "DISABLED";
        else if (statusFilter === "EXPIRED") matchesStatus = link.status === "EXPIRED";
        else if (statusFilter === "PASSWORD") matchesStatus = !!link.passwordProtected;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "clicks") return (b.clickCount || 0) - (a.clickCount || 0);
        if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [links, searchQuery, statusFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredLinks.length / itemsPerPage);
  const paginatedLinks = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLinks.slice(start, start + itemsPerPage);
  }, [filteredLinks, currentPage]);

  const handleToggleStatus = async (link: LinkItem) => {
    const newStatus = link.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    try {
      const res = await fetch(`/api/v1/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      toast({
        type: "success",
        title: `Link ${newStatus === "ACTIVE" ? "Enabled" : "Disabled"}`,
        description: `/${link.shortCode} is now ${newStatus.toLowerCase()}.`,
      });

      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      toastError("Error", (err as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!deleteModalLink) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/links/${deleteModalLink.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete link");

      toast({
        type: "success",
        title: "Link Deleted",
        description: `/${deleteModalLink.shortCode} was permanently removed.`,
      });

      setDeleteModalLink(null);
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      toastError("Error", (err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="w-full p-4 sm:p-6 border-border shadow-sm">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-5 border-b border-border/60">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search links, tags, URLs..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter links by status"
              className="bg-transparent font-medium text-foreground focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
              <option value="EXPIRED">Expired</option>
              <option value="PASSWORD">Password Protected</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "clicks" | "oldest")}
              aria-label="Sort links by criteria"
              className="bg-transparent font-medium text-foreground focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="clicks">Most Clicks</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Links Table */}
      {filteredLinks.length === 0 ? (
        <div className="py-8">
          <EmptyState
            icon={Link2}
            title="No links found"
            description={
              searchQuery || statusFilter !== "ALL"
                ? "Try adjusting your search criteria or status filter."
                : "You haven't forged any short links yet. Transform your first long URL into a short, trackable link."
            }
            actionLabel={onCreateLink ? "Forge Your First Link" : undefined}
            onAction={onCreateLink}
          />
        </div>
      ) : (
        <div className="overflow-x-auto min-h-[260px] pb-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Short Link</th>
                <th className="py-3 px-3">Destination</th>
                <th className="py-3 px-3">Clicks</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {paginatedLinks.map((link, index) => {
                const shortUrl = getShortUrl(link.shortCode);
                const isMenuOpen = activeMenuId === link.id;
                // If near bottom of table, open menu upwards to avoid cutoff
                const isNearBottom = index >= Math.max(0, paginatedLinks.length - 2);

                return (
                  <tr
                    key={link.id}
                    className="hover:bg-accent/40 transition-colors group"
                  >
                    {/* Short Link */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-foreground">
                              /{link.shortCode}
                            </span>
                            <CopyButton text={shortUrl} size="iconSm" variant="ghost" />
                          </div>
                          {link.title && (
                            <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                              {link.title}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Destination URL */}
                    <td className="py-3.5 px-3 max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-muted-foreground text-[11px] truncate">
                          {link.destinationUrl}
                        </span>
                        <a
                          href={link.destinationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:text-foreground shrink-0"
                          title="Open Destination"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      {link.tags && link.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {link.tags.map((t) => (
                            <span
                              key={t.id}
                              className="rounded px-1.5 py-0.5 text-[9px] font-medium bg-primary/10 text-primary border border-primary/20"
                            >
                              {t.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Clicks */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 font-bold font-mono text-foreground text-sm">
                        {formatNumber(link.clickCount)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <StatusBadge
                        status={link.status}
                        passwordProtected={link.passwordProtected}
                        expiresAt={link.expiresAt}
                      />
                    </td>

                    {/* Created */}
                    <td className="py-3.5 px-3 text-muted-foreground text-[11px]">
                      {formatDate(link.createdAt)}
                    </td>

                    {/* Actions Dropdown */}
                    <td className="py-3.5 px-3 text-right relative">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="iconSm"
                          onClick={() => setQrModalLink(link)}
                          title="QR Code"
                        >
                          <QrCode className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        <Link href={`/dashboard/links/${link.id}`}>
                          <Button
                            variant="ghost"
                            size="iconSm"
                            title="Analytics"
                          >
                            <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </Link>
                        <div className="relative inline-block">
                          <Button
                            variant="ghost"
                            size="iconSm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : link.id);
                            }}
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>

                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className={`absolute right-0 z-50 w-44 rounded-xl border border-border bg-card p-1.5 shadow-2xl text-left text-xs font-medium text-card-foreground animate-fade-in ${
                                isNearBottom ? "bottom-full mb-1.5" : "top-full mt-1.5"
                              }`}
                            >
                              <button
                                onClick={() => {
                                  setEditModalLink(link);
                                  setActiveMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-foreground hover:bg-accent"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                <span>Edit Link</span>
                              </button>
                              <button
                                onClick={() => {
                                  handleToggleStatus(link);
                                  setActiveMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-foreground hover:bg-accent"
                              >
                                {link.status === "ACTIVE" ? (
                                  <>
                                    <Ban className="h-3.5 w-3.5 text-amber-500" />
                                    <span>Disable Link</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>Enable Link</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteModalLink(link);
                                  setActiveMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete Link</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/60 pt-4 mt-2">
          <p className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredLinks.length)} of {filteredLinks.length} links
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-xs font-medium text-foreground px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalLink && (
        <QrCodeModal
          open={!!qrModalLink}
          onOpenChange={(open) => !open && setQrModalLink(null)}
          shortCode={qrModalLink.shortCode}
          destinationUrl={qrModalLink.destinationUrl}
        />
      )}

      {/* Edit Link Modal */}
      {editModalLink && (
        <EditLinkModal
          open={!!editModalLink}
          onOpenChange={(open) => !open && setEditModalLink(null)}
          link={editModalLink}
          onSuccess={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteModalLink && (
        <ConfirmDialog
          open={!!deleteModalLink}
          onOpenChange={(open) => !open && setDeleteModalLink(null)}
          title="Delete Short Link?"
          description={`Are you sure you want to delete /${deleteModalLink.shortCode}? Any existing redirects will stop working immediately.`}
          confirmLabel="Delete Link"
          isLoading={isDeleting}
          onConfirm={handleDelete}
        />
      )}
    </Card>
  );
}

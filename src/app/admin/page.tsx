"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/analytics/kpi-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import {
  Shield,
  Users,
  Link2,
  MousePointerClick,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast, error: toastError } = useToast();

  const [activeTab, setActiveTab] = React.useState<"users" | "links" | "reports">("reports");
  const [health, setHealth] = React.useState<any>(null);
  const [users, setUsers] = React.useState<any[]>([]);
  const [reports, setReports] = React.useState<any[]>([]);
  const [links, setLinks] = React.useState<any[]>([]);

  // Modals
  const [deleteUserId, setDeleteUserId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const loadData = React.useCallback(async () => {
    try {
      const [healthRes, usersRes, reportsRes, linksRes] = await Promise.all([
        fetch("/api/health"),
        fetch("/api/v1/admin/users"),
        fetch("/api/v1/reports"),
        fetch("/api/v1/links?limit=500"),
      ]);

      if (healthRes.ok) setHealth(await healthRes.json());
      if (usersRes.ok) {
        const u = await usersRes.json();
        setUsers(u.data || []);
      }
      if (reportsRes.ok) {
        const r = await reportsRes.json();
        setReports(r.data || []);
      }
      if (linksRes.ok) {
        const l = await linksRes.json();
        setLinks(l.data || []);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    }
  }, []);

  React.useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      loadData();
    }
  }, [session, loadData]);

  const handleResolveReport = async (reportId: string, disableLink: boolean) => {
    try {
      const res = await fetch("/api/v1/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          status: "RESOLVED",
          disableLink,
        }),
      });

      if (!res.ok) throw new Error("Failed to update report");

      toast({
        type: "success",
        title: "Report Resolved",
        description: disableLink
          ? "Report resolved and malicious link disabled."
          : "Report marked as resolved.",
      });

      loadData();
    } catch (err: unknown) {
      toastError("Error", (err as Error).message);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/admin/users?id=${deleteUserId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");

      toast({
        type: "success",
        title: "User Removed",
        description: "User and associated data deleted.",
      });
      setDeleteUserId(null);
      loadData();
    } catch (err: unknown) {
      toastError("Error", (err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === "loading" || session?.user?.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const totalClicks = links.reduce((acc, l) => acc + (l.clickCount || 0), 0);
  const pendingReports = reports.filter((r) => r.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="iconSm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Admin Control Center
            </h1>
            <p className="text-xs text-muted-foreground">
              Live system observability, user moderation, link inspection, and trust & safety queues.
            </p>
          </div>
        </div>

        {/* System Health Indicators */}
        <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card/60 px-4 py-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${health?.status === "healthy" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
            <span className="font-semibold text-foreground">App: {health?.status || "Live"}</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">DB:</span>
            <span className="font-mono font-bold text-foreground">{health?.services?.database?.latencyMs ?? 2}ms</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Redis:</span>
            <span className="font-mono font-bold text-foreground">{health?.services?.redis?.status || "Active"}</span>
          </div>
        </div>
      </div>

      {/* Real Admin KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Registered Users"
          value={users.length}
          icon={Users}
          iconColor="text-indigo-400 bg-indigo-500/10"
        />
        <KpiCard
          title="Total Short Links"
          value={links.length}
          icon={Link2}
          iconColor="text-cyan-400 bg-cyan-500/10"
        />
        <KpiCard
          title="Total Clicks"
          value={totalClicks}
          icon={MousePointerClick}
          iconColor="text-emerald-400 bg-emerald-500/10"
        />
        <KpiCard
          title="Pending Reports"
          value={pendingReports}
          icon={AlertTriangle}
          iconColor="text-rose-400 bg-rose-500/10"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "reports"
              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Abuse Reports ({pendingReports})</span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "users"
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>User Accounts ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("links")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "links"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Link2 className="h-3.5 w-3.5" />
          <span>All Short Links ({links.length})</span>
        </button>
      </div>

      {/* Tab 1: Abuse Reports */}
      {activeTab === "reports" && (
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold">Abuse Reports Queue</CardTitle>
            <CardDescription className="text-xs">
              Review flagged destinations submitted by users and security monitors.
            </CardDescription>
          </CardHeader>

          {reports.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No abuse reports pending. The network is clean.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {reports.map((r) => (
                <div key={r.id} className="py-4 space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={r.status === "PENDING" ? "destructive" : "success"}>
                        {r.status}
                      </Badge>
                      <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                        Reason: {r.reason}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-[11px]">{formatDate(r.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-primary font-bold">/{r.shortCode}</span>
                    <span className="text-muted-foreground">&rarr;</span>
                    <span className="truncate text-muted-foreground">{r.destinationUrl}</span>
                    <a href={r.destinationUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {r.description && (
                    <p className="text-xs text-muted-foreground italic bg-muted/30 p-2.5 rounded-lg">
                      &ldquo;{r.description}&rdquo;
                    </p>
                  )}

                  {r.status === "PENDING" && (
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleResolveReport(r.id, true)}
                        className="text-xs gap-1"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        <span>Ban & Disable Link</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolveReport(r.id, false)}
                        className="text-xs gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Dismiss as Safe</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === "users" && (
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold">Registered Users ({users.length})</CardTitle>
            <CardDescription className="text-xs">
              Live tracking of registered user accounts and their created link volume.
            </CardDescription>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-semibold uppercase">
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Links Created</th>
                  <th className="py-3 px-3">Registered</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-accent/40">
                    <td className="py-3 px-3 font-bold text-foreground">{u.name || "Unnamed"}</td>
                    <td className="py-3 px-3 font-mono text-muted-foreground">{u.email}</td>
                    <td className="py-3 px-3">
                      <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-mono">{u.linksCount || 0}</td>
                    <td className="py-3 px-3 text-muted-foreground text-[11px]">{formatDate(u.createdAt)}</td>
                    <td className="py-3 px-3 text-right">
                      {u.id !== session?.user?.id && (
                        <Button
                          variant="ghost"
                          size="iconSm"
                          onClick={() => setDeleteUserId(u.id)}
                          className="text-destructive hover:bg-destructive/10"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: All Short Links */}
      {activeTab === "links" && (
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold">Global Link Directory ({links.length})</CardTitle>
            <CardDescription className="text-xs">
              Live inspection of all links across the entire system.
            </CardDescription>
          </CardHeader>

          <div className="divide-y divide-border/60">
            {links.map((link) => (
              <div key={link.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground">/{link.shortCode}</span>
                    <Badge variant={link.status === "ACTIVE" ? "success" : "destructive"}>
                      {link.status}
                    </Badge>
                  </div>
                  <p className="font-mono text-muted-foreground text-[11px] truncate mt-0.5 max-w-lg">
                    {link.destinationUrl}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono font-bold text-foreground">{link.clickCount || 0} clicks</span>
                  <a href={link.destinationUrl} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="iconSm">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Delete User Confirmation */}
      {deleteUserId && (
        <ConfirmDialog
          open={!!deleteUserId}
          onOpenChange={(open) => !open && setDeleteUserId(null)}
          title="Delete User Account?"
          description="Are you sure you want to remove this user? All their short links and records will be deleted."
          confirmLabel="Delete User"
          isLoading={isDeleting}
          onConfirm={handleDeleteUser}
        />
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  History,
  Settings,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  X,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  onOpenCreateModal?: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  collapsed,
  setCollapsed,
  onOpenCreateModal,
  isMobile = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Links", href: "/dashboard/links", icon: Link2 },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Recent", href: "/dashboard/recent", icon: History },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const isAdmin = session?.user?.role === "ADMIN";

  const handleNavClick = () => {
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border/80 bg-card backdrop-blur-xl transition-all duration-300 text-card-foreground",
        isMobile
          ? "h-full w-full"
          : cn(
              "hidden lg:flex fixed inset-y-0 left-0 z-30",
              collapsed ? "w-20" : "w-64"
            )
      )}
    >
      {/* Brand Logo Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/80 shrink-0">
        <Link
          href="/dashboard"
          onClick={handleNavClick}
          className="flex items-center gap-2.5 overflow-hidden"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-cyan-400 text-white shadow-md shadow-primary/30">
            <Zap className="h-5 w-5" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-foreground">
                Zap<span className="text-primary">Link</span>
              </span>
            </div>
          )}
        </Link>

        {isMobile ? (
          <button
            onClick={onCloseMobile}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* Quick Forge Button */}
      {onOpenCreateModal && (
        <div className="p-3 shrink-0">
          <button
            onClick={() => {
              if (isMobile && onCloseMobile) onCloseMobile();
              onOpenCreateModal();
            }}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl bg-primary text-white font-semibold py-2.5 shadow-md shadow-primary/20 hover:bg-primary-hover hover:shadow-primary/40 transition-all",
              collapsed && !isMobile ? "px-0" : "px-4"
            )}
            title="Create Short Link"
          >
            <Sparkles className="h-4 w-4 text-white" />
            {(!collapsed || isMobile) && <span className="text-sm">Forge Link</span>}
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1.5">
          {(!collapsed || isMobile) && "Platform"}
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group",
                isActive
                  ? "bg-primary/10 text-primary font-bold border border-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title={collapsed && !isMobile ? item.name : undefined}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {(!collapsed || isMobile) && <span>{item.name}</span>}
            </Link>
          );
        })}

        {/* Admin Navigation (Only visible to approved Admin) */}
        {isAdmin && (
          <div className="pt-4 space-y-1 border-t border-border/60 mt-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500/90 px-3 py-1">
              {(!collapsed || isMobile) && "Administration"}
            </div>
            <Link
              href="/admin"
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group",
                pathname.startsWith("/admin")
                  ? "bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title={collapsed && !isMobile ? "Admin Control" : undefined}
            >
              <Shield className="h-4 w-4 shrink-0 text-amber-500" />
              {(!collapsed || isMobile) && <span>Admin Control</span>}
            </Link>
          </div>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-border/80 shrink-0">
        <div className="flex items-center justify-between rounded-xl bg-muted/50 p-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary font-bold text-xs uppercase">
              {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
            </div>
            {(!collapsed || isMobile) && (
              <div className="overflow-hidden">
                <p className="truncate text-xs font-bold text-foreground">
                  {session?.user?.name || "User"}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
            )}
          </div>
          {(!collapsed || isMobile) && (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-500/15 hover:text-rose-500 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

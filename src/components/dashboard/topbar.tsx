"use client";

import * as React from "react";
import { Search, Menu, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "../shared/theme-toggle";
import { useSession } from "next-auth/react";

interface TopbarProps {
  onOpenCommandPalette: () => void;
  onOpenCreateModal?: () => void;
  onToggleMobileSidebar?: () => void;
}

export function Topbar({
  onOpenCommandPalette,
  onToggleMobileSidebar,
}: TopbarProps) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/80 bg-background/80 px-4 sm:px-6 backdrop-blur-xl">
      {/* Left: Mobile hamburger & Search trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex h-10 w-48 sm:w-72 items-center justify-between rounded-xl border border-border/80 bg-muted/40 px-3 text-xs text-muted-foreground transition-all hover:bg-muted hover:border-primary/40 group"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
            <span>Search or command...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Clean Theme Toggle & User Avatar */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {/* Avatar Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-border/80">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary font-bold text-xs ring-2 ring-primary/20">
            {session?.user?.name?.[0] || session?.user?.email?.[0] || <UserIcon className="h-4 w-4" />}
          </div>
        </div>
      </div>
    </header>
  );
}

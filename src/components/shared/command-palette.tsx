"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "../ui/dialog";
import {
  Search,
  Plus,
  BarChart3,
  QrCode,
  Key,
  Settings,
  BookOpen,
  Sun,
  Moon,
  Link as LinkIcon,
  LogOut,
  Shield,
} from "lucide-react";
import { useTheme } from "./theme-provider";
import { useSession, signOut } from "next-auth/react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateLink?: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onCreateLink,
}: CommandPaletteProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const runAction = (action: () => void) => {
    onOpenChange(false);
    setQuery("");
    action();
  };

  const actions = [
    {
      id: "create-link",
      title: "Create Short Link",
      category: "Actions",
      icon: Plus,
      perform: () => (onCreateLink ? onCreateLink() : router.push("/dashboard/links")),
    },
    {
      id: "links",
      title: "View All Links",
      category: "Navigation",
      icon: LinkIcon,
      perform: () => router.push("/dashboard/links"),
    },
    {
      id: "analytics",
      title: "Analytics Overview",
      category: "Navigation",
      icon: BarChart3,
      perform: () => router.push("/dashboard/analytics"),
    },
    {
      id: "recent",
      title: "Recent Links Activity",
      category: "Navigation",
      icon: LinkIcon,
      perform: () => router.push("/dashboard/recent"),
    },
    {
      id: "settings",
      title: "Account Settings",
      category: "Navigation",
      icon: Settings,
      perform: () => router.push("/dashboard/settings"),
    },
    {
      id: "docs",
      title: "Developer Documentation",
      category: "Resources",
      icon: BookOpen,
      perform: () => router.push("/docs"),
    },
    ...(session?.user?.role === "ADMIN"
      ? [
          {
            id: "admin",
            title: "Admin Control Center",
            category: "Admin",
            icon: Shield,
            perform: () => router.push("/admin"),
          },
        ]
      : []),
    {
      id: "theme",
      title: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      category: "Preferences",
      icon: theme === "dark" ? Sun : Moon,
      perform: () => setTheme(theme === "dark" ? "light" : "dark"),
    },
    ...(session
      ? [
          {
            id: "logout",
            title: "Sign Out",
            category: "Account",
            icon: LogOut,
            perform: () => signOut({ callbackUrl: "/" }),
          },
        ]
      : []),
  ];

  const filteredActions = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="max-w-xl">
      <div className="flex flex-col -m-6">
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-border/80 px-4 py-3.5">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center rounded border border-border/80 bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              {filteredActions.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => runAction(item.perform)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-accent group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground/80 font-mono">
                      {item.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}

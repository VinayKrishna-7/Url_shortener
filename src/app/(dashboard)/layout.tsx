"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { CommandPalette } from "@/components/shared/command-palette";
import { CreateLinkModal } from "@/components/links/create-link-modal";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const [createModalOpen, setCreateModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs font-mono text-muted-foreground">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-x-hidden">
      {/* Desktop Sidebar (Only visible on lg screens >= 1024px) */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onOpenCreateModal={() => setCreateModalOpen(true)}
      />

      {/* Mobile Drawer Sidebar (Only on screens < 1024px) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-50 w-72 max-w-[80vw] h-full shadow-2xl bg-card">
            <Sidebar
              collapsed={false}
              setCollapsed={() => {}}
              onOpenCreateModal={() => {
                setMobileSidebarOpen(false);
                setCreateModalOpen(true);
              }}
              isMobile={true}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area - Full Width Adoption */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 min-h-screen w-full",
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        <Topbar
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenCreateModal={() => setCreateModalOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          {children}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onCreateLink={() => setCreateModalOpen(true)}
      />

      {/* Global Create Link Modal */}
      <CreateLinkModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}

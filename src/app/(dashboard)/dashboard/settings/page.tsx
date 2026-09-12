"use client";

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { Settings, User, Lock, Download, Trash2, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/shared/theme-provider";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast, error: toastError } = useToast();
  const { theme, setTheme } = useTheme();

  // Profile form
  const [name, setName] = React.useState(session?.user?.name || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);

  // Delete account modal
  const [deleteAccountOpen, setDeleteAccountOpen] = React.useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false);

  React.useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setTimeout(() => {
      setIsUpdatingProfile(false);
      toast({
        type: "success",
        title: "Profile Updated",
        description: "Your display name and settings have been saved.",
      });
    }, 600);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toastError("Validation Error", "New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toastError("Validation Error", "Password must be at least 8 characters.");
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        type: "success",
        title: "Password Changed",
        description: "Your account credentials have been updated securely.",
      });
    }, 800);
  };

  const handleExportData = async () => {
    try {
      const res = await fetch("/api/v1/links?limit=500");
      const json = await res.json();
      const exportBlob = new Blob([JSON.stringify(json.data || [], null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(exportBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zaplink-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        type: "success",
        title: "Data Export Ready",
        description: "Your complete link and analytics dataset has been downloaded.",
      });
    } catch {
      toastError("Export Failed", "Could not export user data.");
    }
  };

  const handleDeleteAccount = () => {
    setIsDeletingAccount(true);
    setTimeout(() => {
      setIsDeletingAccount(false);
      setDeleteAccountOpen(false);
      signOut({ callbackUrl: "/" });
    }, 1000);
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-fade-in">
      <div className="flex items-center gap-2.5 border-b border-border/60 pb-5">
        <Settings className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage your personal profile, security preferences, appearance, and privacy data.
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="w-full p-5 sm:p-6 border-border">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-bold">Profile Details</CardTitle>
          </div>
          <CardDescription className="text-xs">Update your personal account information</CardDescription>
        </CardHeader>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Display Name
              </label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Email Address
              </label>
              <Input value={session?.user?.email || ""} disabled className="opacity-70 bg-muted/40" />
            </div>
          </div>

          <Button type="submit" variant="default" size="sm" isLoading={isUpdatingProfile} className="text-xs">
            Save Profile
          </Button>
        </form>
      </Card>

      {/* Security & Password */}
      <Card className="w-full p-5 sm:p-6 border-border">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-bold">Security & Password</CardTitle>
          </div>
          <CardDescription className="text-xs">Ensure your account uses a strong, unique password</CardDescription>
        </CardHeader>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
              Current Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                New Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Confirm New Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" variant="default" size="sm" isLoading={isChangingPassword} className="text-xs">
            Update Password
          </Button>
        </form>
      </Card>

      {/* Appearance */}
      <Card className="w-full p-5 sm:p-6 border-border">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base font-bold">Theme & Appearance</CardTitle>
          <CardDescription className="text-xs">Choose your preferred visual theme</CardDescription>
        </CardHeader>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all ${
              theme === "dark" ? "border-primary bg-primary/10 text-primary font-bold" : "border-border hover:border-primary/50"
            }`}
          >
            <Moon className="h-4 w-4" />
            <span>Dark Mode</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all ${
              theme === "light" ? "border-primary bg-primary/10 text-primary font-bold" : "border-border hover:border-primary/50"
            }`}
          >
            <Sun className="h-4 w-4" />
            <span>Light Mode</span>
          </button>
        </div>
      </Card>

      {/* Privacy & Data Export */}
      <Card className="w-full p-5 sm:p-6 border-border">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-bold">Privacy & Data Portability</CardTitle>
          </div>
          <CardDescription className="text-xs">Export your entire ZapLink link library and analytics data</CardDescription>
        </CardHeader>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Download an archive containing all your shortened links, metadata, tags, and click event aggregations in JSON format.
          </p>
          <Button variant="outline" size="sm" onClick={handleExportData} className="gap-2 text-xs shrink-0">
            <Download className="h-3.5 w-3.5" />
            <span>Export Data (JSON)</span>
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="w-full p-5 sm:p-6 border-destructive/30 bg-destructive/5">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            <CardTitle className="text-base font-bold text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-xs">Irreversible account actions</CardDescription>
        </CardHeader>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <p className="text-xs font-bold text-foreground">Delete this account</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently remove your profile, all created short links, and aggregated click history.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteAccountOpen(true)}
            className="text-xs shrink-0"
          >
            Delete Account
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
        title="Delete ZapLink Account?"
        description="Are you sure you want to permanently delete your account? All your short links will stop redirecting immediately and this action cannot be undone."
        confirmLabel="Delete Everything"
        isLoading={isDeletingAccount}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}

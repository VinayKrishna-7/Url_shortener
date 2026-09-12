"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Lock, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";

export default function UnlockPage() {
  return (
    <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <UnlockContent />
    </React.Suspense>
  );
}

function UnlockContent() {
  const searchParams = useSearchParams();
  const shortCode = searchParams.get("code") || "";

  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortCode, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || "Incorrect password. Please try again.");
      }

      if (json.data?.destinationUrl) {
        window.location.href = json.data.destinationUrl;
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-cyan-400 text-white shadow-lg shadow-primary/30">
              <Zap className="h-6 w-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-foreground">
              Link<span className="text-primary">Forge</span>
            </span>
          </Link>
        </div>

        <Card className="p-6 backdrop-blur-xl shadow-2xl border-border/80 glow-purple">
          <CardHeader className="p-0 pb-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3 ring-8 ring-amber-500/5">
              <Lock className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl font-bold">Password Protected Link</CardTitle>
            <CardDescription className="text-xs mt-1">
              The owner has protected <span className="font-mono font-semibold text-foreground">/{shortCode}</span> with a security passkey.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter link password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4" />}
                  error={error}
                  autoFocus
                  required
                />
              </div>

              <Button
                type="submit"
                variant="glow"
                isLoading={isLoading}
                className="w-full h-11 rounded-xl text-xs font-bold gap-2 shadow-md shadow-primary/20"
              >
                <span>Unlock & Access Destination</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Protected by ZapLink Security Gateway</span>
        </div>
      </motion.div>
    </div>
  );
}

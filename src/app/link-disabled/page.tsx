"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Ban, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LinkDisabledPage() {
  return (
    <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <DisabledContent />
    </React.Suspense>
  );
}

function DisabledContent() {
  const searchParams = useSearchParams();
  const shortCode = searchParams.get("code") || "";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
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

        <Card className="p-8 backdrop-blur-xl shadow-2xl border-border/80">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4 ring-8 ring-amber-500/5">
            <Ban className="h-8 w-8" />
          </div>

          <CardTitle className="text-xl font-bold">This Link Has Been Deactivated</CardTitle>
          <CardDescription className="text-xs mt-2 leading-relaxed">
            The short link <span className="font-mono font-semibold text-foreground">/{shortCode}</span> is currently paused or deactivated by its owner.
          </CardDescription>

          <div className="mt-8">
            <Link href="/">
              <Button variant="glow" className="w-full gap-2 text-xs font-semibold">
                <span>Return to ZapLink</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

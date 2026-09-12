"use client";

import Link from "next/link";
import { Zap, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-background text-foreground">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

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

        <Card className="p-8 backdrop-blur-xl shadow-2xl border-border/80 glow-purple">
          <span className="font-mono text-6xl font-extrabold text-primary">404</span>
          <CardTitle className="text-xl font-bold mt-4">Page or Short Link Not Found</CardTitle>
          <CardDescription className="text-xs mt-2 leading-relaxed">
            The link you followed may have expired, been deleted, or does not exist on ZapLink.
          </CardDescription>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/" className="w-full">
              <Button variant="glow" className="w-full gap-2 text-xs font-semibold">
                <Home className="h-4 w-4" />
                <span>ZapLink Home</span>
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

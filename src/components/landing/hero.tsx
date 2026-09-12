"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, Zap, BarChart3, QrCode } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";

export function LandingHero() {
  const { data: session } = useSession();

  return (
    <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/3 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto max-w-5xl px-4 text-center">
        {/* Release / Announcement Tag */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md mb-6"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>ZapLink 2.0 &bull; Secure Shortening & Real-Time Click Intelligence</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]"
        >
          Turn long URLs into <br />
          <span className="bg-gradient-to-r from-primary via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            powerful links.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed"
        >
          Create short, memorable links, generate high-resolution QR codes, and understand
          exactly how your audience interacts with them in real-time.
        </motion.p>

        {/* Authentication-Gated Hero CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
        >
          {session ? (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="glow" size="lg" className="w-full sm:w-auto gap-2 font-bold text-sm h-12 px-8 shadow-xl shadow-primary/25">
                <Zap className="h-4 w-4" />
                <span>Open Your Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button variant="glow" size="lg" className="w-full sm:w-auto gap-2 font-bold text-sm h-12 px-8 shadow-xl shadow-primary/25">
                  <Zap className="h-4 w-4" />
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sign-in" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold text-sm h-12 px-6">
                  <span>Sign In</span>
                </Button>
              </Link>
            </>
          )}
        </motion.div>

        {/* Value Props Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/60 p-3.5 backdrop-blur-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Authenticated Access</p>
              <p className="text-[11px] text-muted-foreground">Encrypted accounts & secure link ownership</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/60 p-3.5 backdrop-blur-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 shrink-0">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Real-Time Analytics</p>
              <p className="text-[11px] text-muted-foreground">Live click geographic & device intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/60 p-3.5 backdrop-blur-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Dynamic QR Codes</p>
              <p className="text-[11px] text-muted-foreground">High-res PNG and vector SVG exports</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

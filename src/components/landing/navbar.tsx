"use client";

import * as React from "react";
import Link from "next/link";
import { Zap, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { ThemeToggle } from "../shared/theme-toggle";
import { useSession } from "next-auth/react";

export function LandingNavbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl transition-all">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Left Nav */}
        <div className="flex items-center gap-8 lg:gap-10">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-cyan-400 text-white shadow-md shadow-primary/30 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-foreground">
                Zap<span className="text-primary">Link</span>
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#analytics" className="hover:text-foreground transition-colors">
              Analytics
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#developers" className="hover:text-foreground transition-colors">
              API & Developers
            </a>
            <Link href="/docs" className="hover:text-foreground transition-colors">
              Documentation
            </Link>
            <Link href="/report" className="hover:text-foreground transition-colors">
              Report Abuse
            </Link>
          </nav>
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {session ? (
            <Link href="/dashboard">
              <Button variant="glow" size="sm" className="gap-1.5 font-semibold">
                <span>Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="font-medium text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="glow" size="sm" className="gap-1.5 font-semibold text-xs shadow-md shadow-primary/25">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Get Started</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

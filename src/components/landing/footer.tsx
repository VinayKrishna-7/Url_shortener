import * as React from "react";
import Link from "next/link";
import { Zap, Github, Twitter, ShieldCheck } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/80 py-12 text-xs text-muted-foreground">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-cyan-400 text-white shadow-md">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-foreground">
                Zap<span className="text-primary">Link</span>
              </span>
            </Link>
            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              Production-grade URL shortening, branded links, dynamic QR generation, and real-time click intelligence for modern teams.
            </p>
            <div className="flex items-center gap-3 text-muted-foreground">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors p-1"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors p-1"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="font-bold text-foreground mb-3 uppercase tracking-wider text-[11px]">
              Product
            </p>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="hover:text-foreground transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#analytics" className="hover:text-foreground transition-colors">
                  Analytics
                </a>
              </li>
              <li>
                <Link href="/dashboard/qr" className="hover:text-foreground transition-colors">
                  QR Studio
                </Link>
              </li>
              <li>
                <a href="#pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Developers */}
          <div>
            <p className="font-bold text-foreground mb-3 uppercase tracking-wider text-[11px]">
              Developers
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="hover:text-foreground transition-colors">
                  REST API Docs
                </Link>
              </li>
              <li>
                <Link href="/api/health" className="hover:text-foreground transition-colors">
                  System Health
                </Link>
              </li>
              <li>
                <a href="#developers" className="hover:text-foreground transition-colors">
                  Code Snippets
                </a>
              </li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div>
            <p className="font-bold text-foreground mb-3 uppercase tracking-wider text-[11px]">
              Trust & Legal
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/report" className="hover:text-foreground transition-colors">
                  Report Abuse
                </Link>
              </li>
              <li>
                <span className="cursor-pointer hover:text-foreground transition-colors">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-foreground transition-colors">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-foreground transition-colors">
                  Security
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border/40 pt-6 text-[11px]">
          <p>© {new Date().getFullYear()} ZapLink Inc. All rights reserved.</p>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>99.99% Uptime &bull; TLS 1.3 Encrypted</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

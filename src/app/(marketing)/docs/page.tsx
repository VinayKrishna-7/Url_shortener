"use client";

import * as React from "react";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/shared/copy-button";
import { Terminal, Shield, Sparkles, Key, Zap, Layers, AlertCircle } from "lucide-react";

export default function DocsPage() {
  const [activeLang, setActiveLang] = React.useState<"curl" | "js" | "python">("curl");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LandingNavbar />

      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto max-w-5xl px-4">
          {/* Header */}
          <div className="mb-12 border-b border-border/60 pb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-4">
              <Terminal className="h-3.5 w-3.5" />
              <span>ZapLink REST API v1</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Developer Documentation
            </h1>
            <p className="mt-3 text-base text-muted-foreground max-w-2xl leading-relaxed">
              Integrate programmatic URL shortening, QR code generation, and click analytics
              directly into your applications and services.
            </p>
          </div>

          {/* Docs Layout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Sidebar navigation */}
            <div className="md:col-span-3 space-y-4">
              <div className="sticky top-24 space-y-1 text-xs font-medium">
                <p className="font-bold text-foreground uppercase tracking-wider mb-2 text-[11px]">
                  Getting Started
                </p>
                <a href="#overview" className="block py-1.5 text-muted-foreground hover:text-foreground">
                  Overview & Base URL
                </a>
                <a href="#authentication" className="block py-1.5 text-muted-foreground hover:text-foreground">
                  Authentication
                </a>
                <a href="#rate-limits" className="block py-1.5 text-muted-foreground hover:text-foreground">
                  Rate Limits
                </a>

                <p className="font-bold text-foreground uppercase tracking-wider mt-6 mb-2 text-[11px]">
                  Endpoints
                </p>
                <a href="#create-link" className="block py-1.5 text-muted-foreground hover:text-foreground">
                  Create Short Link
                </a>
                <a href="#list-links" className="block py-1.5 text-muted-foreground hover:text-foreground">
                  List Links
                </a>
                <a href="#get-analytics" className="block py-1.5 text-muted-foreground hover:text-foreground">
                  Get Link Analytics
                </a>
                <a href="#delete-link" className="block py-1.5 text-muted-foreground hover:text-foreground">
                  Delete Link
                </a>

                <p className="font-bold text-foreground uppercase tracking-wider mt-6 mb-2 text-[11px]">
                  Reference
                </p>
                <a href="#errors" className="block py-1.5 text-muted-foreground hover:text-foreground">
                  Error Codes
                </a>
              </div>
            </div>

            {/* Main Content Body */}
            <div className="md:col-span-9 space-y-12">
              {/* Overview */}
              <section id="overview" className="space-y-4 scroll-mt-24">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Overview & Base URL
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  The ZapLink REST API is served over HTTPS and communicates via JSON. All requests must use valid Content-Type and Accept headers.
                </p>
                <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/40 p-3.5 font-mono text-xs">
                  <span className="text-primary font-bold">https://zaplink.app/api/v1</span>
                  <CopyButton text="https://zaplink.app/api/v1" size="sm" variant="ghost" />
                </div>
              </section>

              {/* Authentication */}
              <section id="authentication" className="space-y-4 scroll-mt-24">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  Authentication
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Authenticate your API requests by passing your API key as a Bearer token in the <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">Authorization</code> header. You can generate and manage keys in your <a href="/dashboard/api" className="text-primary underline">API Dashboard</a>.
                </p>
                <div className="rounded-xl border border-border/80 bg-slate-950 p-4 font-mono text-xs text-indigo-300">
                  Authorization: Bearer lf_live_9a8f7c6e5d4c3b2a...
                </div>
              </section>

              {/* Rate Limits */}
              <section id="rate-limits" className="space-y-4 scroll-mt-24">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Rate Limits
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Every response includes standard RFC rate limit headers allowing client systems to throttle requests proactively:
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-5">
                  <li><strong className="text-foreground font-mono">X-RateLimit-Limit</strong>: Max requests allowed in current window</li>
                  <li><strong className="text-foreground font-mono">X-RateLimit-Remaining</strong>: Remaining quota in current window</li>
                  <li><strong className="text-foreground font-mono">X-RateLimit-Reset</strong>: UTC timestamp when quota resets</li>
                </ul>
              </section>

              {/* Endpoint: Create Short Link */}
              <section id="create-link" className="space-y-4 scroll-mt-24">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="font-mono text-xs">POST</Badge>
                  <h3 className="text-lg font-bold font-mono text-foreground">/api/v1/links</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Creates a short link. Destination URL is required. Custom alias, password protection, and UTM parameters are optional.
                </p>

                <div className="overflow-hidden rounded-xl border border-border bg-slate-950">
                  <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2 text-xs font-mono text-slate-400">
                    <span>Request Body</span>
                    <CopyButton
                      text={`curl -X POST https://zaplink.app/api/v1/links \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"destinationUrl": "https://example.com/item", "customAlias": "sale"}'`}
                      variant="glass"
                      size="iconSm"
                    />
                  </div>
                  <pre className="p-4 text-xs font-mono text-cyan-300 overflow-x-auto">
{`{
  "destinationUrl": "https://example.com/products/sale",
  "customAlias": "summer26",      // Optional (3-50 chars)
  "title": "Summer Campaign",      // Optional
  "password": "secret_key_123",    // Optional
  "expiresAt": "2026-12-31T23:59:59Z", // Optional ISO timestamp
  "utmSource": "twitter",         // Optional
  "utmMedium": "social"           // Optional
}`}
                  </pre>
                </div>
              </section>

              {/* Endpoint: Get Link Analytics */}
              <section id="get-analytics" className="space-y-4 scroll-mt-24">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs">GET</Badge>
                  <h3 className="text-lg font-mono font-bold text-foreground">/api/v1/links/:id/analytics</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Returns total clicks, unique visitors, time-series data, top countries, devices, and referrers.
                </p>
              </section>

              {/* Errors */}
              <section id="errors" className="space-y-4 scroll-mt-24">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-400" />
                  Error Codes
                </h2>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Code</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-mono text-muted-foreground">
                      <tr>
                        <td className="py-2 px-3 text-foreground font-bold">INVALID_URL</td>
                        <td className="py-2 px-3">400</td>
                        <td className="py-2 px-3">Destination URL is malformed, dangerous, or points to private IP</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-foreground font-bold">ALIAS_IN_USE</td>
                        <td className="py-2 px-3">409</td>
                        <td className="py-2 px-3">The specified custom alias is already reserved or in use</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-foreground font-bold">UNAUTHORIZED</td>
                        <td className="py-2 px-3">401</td>
                        <td className="py-2 px-3">API key or session credentials are missing or invalid</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-foreground font-bold">RATE_LIMITED</td>
                        <td className="py-2 px-3">429</td>
                        <td className="py-2 px-3">Rate limit quota exceeded. Retry after specified header window</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

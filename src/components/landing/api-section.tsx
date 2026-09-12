"use client";

import * as React from "react";
import { Terminal, Copy, Check, Code2, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { CopyButton } from "../shared/copy-button";

export function LandingApiSection() {
  const [activeTab, setActiveTab] = React.useState<"curl" | "typescript" | "python">("curl");

  const codeSnippets = {
    curl: `curl -X POST https://zaplink.app/api/v1/links \\
  -H "Authorization: Bearer lf_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "destinationUrl": "https://example.com/products/summer-drop",
    "customAlias": "summer26",
    "utmSource": "newsletter",
    "utmCampaign": "summer_promo"
  }'`,
    typescript: `import axios from 'axios';

const response = await axios.post(
  'https://zaplink.app/api/v1/links',
  {
    destinationUrl: 'https://example.com/products/summer-drop',
    customAlias: 'summer26',
    utmSource: 'newsletter',
  },
  {
    headers: {
      Authorization: \`Bearer \${process.env.ZAPLINK_API_KEY}\`,
    },
  }
);

console.log(response.data.shortUrl);
// => "https://zaplink.app/summer26"`,
    python: `import requests

url = "https://zaplink.app/api/v1/links"
headers = {
    "Authorization": "Bearer lf_live_YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "destinationUrl": "https://example.com/products/summer-drop",
    "customAlias": "summer26"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json()["data"]["shortUrl"])`,
  };

  return (
    <section id="developers" className="py-20 md:py-28 bg-muted/15 border-t border-border/60 relative">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Info & CTA */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-400">
              <Code2 className="h-3.5 w-3.5" />
              <span>Developer First Architecture</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Programmatic link shortening for modern developers
            </h2>

            <p className="text-muted-foreground text-sm leading-relaxed">
              Integrate short link generation into your CI/CD pipelines, SMS delivery services,
              marketing automation engines, and backend applications with our REST API.
            </p>

            <ul className="space-y-3 text-xs font-medium text-foreground">
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check className="h-3 w-3" />
                </span>
                <span>Sub-15ms programmatic link generation</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check className="h-3 w-3" />
                </span>
                <span>SHA-256 hashed and revocable API keys</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check className="h-3 w-3" />
                </span>
                <span>Standard RFC rate limiting headers</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link href="/docs">
                <Button variant="outline" className="gap-2 text-xs font-semibold">
                  <span>Explore API Documentation</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Code Window */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-slate-950 shadow-2xl">
              {/* Terminal Window Header */}
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-xs text-slate-400 flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5" />
                    v1/links.sh
                  </span>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-1 rounded-lg bg-slate-950 p-1 text-[11px] font-mono">
                  {(["curl", "typescript", "python"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded px-2 py-0.5 capitalize transition-all ${
                        activeTab === tab
                          ? "bg-primary text-white font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Editor Body */}
              <div className="relative p-5">
                <div className="absolute right-4 top-4">
                  <CopyButton text={codeSnippets[activeTab]} size="iconSm" variant="glass" />
                </div>
                <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-indigo-200">
                  <code>{codeSnippets[activeTab]}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

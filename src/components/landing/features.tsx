import * as React from "react";
import {
  Link2,
  Sliders,
  BarChart3,
  QrCode,
  Clock,
  Code2,
  Users2,
  ShieldCheck,
} from "lucide-react";
import { Card } from "../ui/card";

export function LandingFeatures() {
  const features = [
    {
      icon: Link2,
      title: "Lightning Short Links",
      description:
        "Sub-millisecond redirect speeds globally with smart edge caching and privacy-preserving routing.",
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      icon: Sliders,
      title: "Custom Aliases & UTMs",
      description:
        "Create branded links like zaplink.app/launch and automatically append UTM tracking parameters.",
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      icon: BarChart3,
      title: "Deep Real-Time Analytics",
      description:
        "Track clicks, unique visitors, geographic origins, operating systems, browsers, and top referrers.",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: QrCode,
      title: "Dynamic QR Code Studio",
      description:
        "Generate custom-styled QR codes with high error-correction levels and export in crisp PNG or scalable SVG.",
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      icon: Clock,
      title: "Expiration & Password Gates",
      description:
        "Configure time-based link expiration or protect sensitive destinations with cryptographic passwords.",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      icon: Code2,
      title: "Developer REST API",
      description:
        "Automate link generation with our public REST API, API key management, and generous rate limits.",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
    {
      icon: Users2,
      title: "Team Collaboration",
      description:
        "Invite team members, organize links with tags, and share unified performance dashboards across departments.",
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      icon: ShieldCheck,
      title: "SSRF & Threat Defense",
      description:
        "Automated malicious URL detection, phishing domain blocklists, and private IP range filtering.",
      color: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 relative">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
            Engineered for Performance
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Everything you need to scale your links
          </p>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
            ZapLink provides enterprise-grade infrastructure packaged in an intuitive,
            delightful interface.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 group"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${item.color} mb-5 transition-transform group-hover:scale-110`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

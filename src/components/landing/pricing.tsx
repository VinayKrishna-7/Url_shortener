import * as React from "react";
import { Check, Sparkles } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";

export function LandingPricing() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Ideal for individual developers and creators starting out.",
      features: [
        "Up to 50 active short links",
        "30-day click analytics history",
        "Dynamic QR code generator",
        "Standard redirect speed",
        "Community support",
      ],
      cta: "Get Started Free",
      href: "/sign-up",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      description: "For professionals and growing marketing teams.",
      features: [
        "Unlimited short links",
        "1-year detailed analytics retention",
        "Custom branded domains & aliases",
        "Password & expiration protection",
        "Full REST API access (300 req/min)",
        "Priority email support",
      ],
      cta: "Start 14-Day Free Trial",
      href: "/sign-up",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "$79",
      period: "per month",
      description: "Dedicated infrastructure, teams, and high-volume limits.",
      features: [
        "Everything in Pro",
        "Multi-user team workspaces",
        "Role-based access controls",
        "SSRF & advanced threat scanning",
        "Dedicated rate limit pools",
        "99.99% SLA & 24/7 support",
      ],
      cta: "Contact Sales",
      href: "/sign-up",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-28 relative">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
            Predictable Pricing
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Simple plans for every scale
          </p>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
            Choose the plan that fits your growth. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`flex flex-col justify-between p-8 transition-all duration-300 relative ${
                tier.highlighted
                  ? "border-primary shadow-2xl glow-purple bg-card"
                  : "border-border/80 bg-card/60"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-0.5 text-[11px] font-bold text-white shadow-md">
                  <Sparkles className="h-3 w-3" />
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 min-h-[32px]">
                  {tier.description}
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground">
                    {tier.price}
                  </span>
                  <span className="text-xs text-muted-foreground">/{tier.period}</span>
                </div>

                <div className="mt-8 space-y-3 border-t border-border/60 pt-6">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                <Link href={tier.href} className="w-full">
                  <Button
                    variant={tier.highlighted ? "glow" : "outline"}
                    className="w-full font-semibold text-xs py-5"
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

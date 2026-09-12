import * as React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../ui/button";

export function LandingCta() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="relative rounded-3xl border border-primary/40 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent p-10 sm:p-16 text-center backdrop-blur-xl shadow-2xl glow-purple">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/20 px-3.5 py-1 text-xs font-semibold text-primary mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Instant Setup &bull; No Credit Card Required</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Ready to forge your first link?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Join thousands of developers, growth marketers, and creators using ZapLink
            to manage and measure their link performance.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button variant="glow" size="lg" className="w-full sm:w-auto gap-2 font-bold shadow-lg">
                <span>Get Started Free</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/docs" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold">
                Explore API Docs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

import * as React from "react";
import { Link2, Sliders, Share2 } from "lucide-react";

export function LandingHowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Link2,
      title: "Paste your destination URL",
      description:
        "Input any long URL, landing page, app link, or marketing campaign destination.",
    },
    {
      number: "02",
      icon: Sliders,
      title: "Customize & brand your link",
      description:
        "Add custom slugs, UTM tracking tags, expiration dates, or passwords in seconds.",
    },
    {
      number: "03",
      icon: Share2,
      title: "Share & track performance",
      description:
        "Distribute via social, email, or QR codes and observe real-time click analytics stream in.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 relative">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
            Streamlined Workflow
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            How ZapLink Works
          </p>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
            Three simple steps to transform messy URLs into high-performing conversion engines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center p-8 rounded-3xl border border-border/80 bg-card/40 backdrop-blur-sm transition-all hover:border-primary/40 group"
              >
                {/* Step Number Badge */}
                <div className="absolute -top-4 font-mono font-extrabold text-xs px-3 py-1 rounded-full bg-primary text-white shadow-md shadow-primary/30">
                  Step {step.number}
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 ring-8 ring-primary/5 group-hover:scale-110 transition-transform">
                  <Icon className="h-8 w-8" />
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2.5">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

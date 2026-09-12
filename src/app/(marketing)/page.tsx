import { LandingNavbar } from "@/components/landing/navbar";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingAnalyticsPreview } from "@/components/landing/analytics-preview";
import { LandingHowItWorks } from "@/components/landing/how-it-works";
import { LandingApiSection } from "@/components/landing/api-section";
import { LandingPricing } from "@/components/landing/pricing";
import { LandingCta } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";

export const metadata = {
  title: "⚡ ZapLink — Modern URL Shortener & Analytics",
  description: "Fast, secure URL shortener SaaS with real-time analytics, instant QR codes, and audience insights.",
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <LandingNavbar />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingAnalyticsPreview />
        <LandingHowItWorks />
        <LandingApiSection />
        <LandingPricing />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}

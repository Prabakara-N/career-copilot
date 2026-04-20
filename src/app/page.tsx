import { LandingHero } from "@/components/landing/landing-hero";
import { SetupReminder } from "@/components/landing/setup-reminder";
import { FeatureBento } from "@/components/landing/feature-bento";
import { CtaSection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <LandingHero />
      <SetupReminder />
      <FeatureBento />
      <CtaSection />
      <LandingFooter />
    </main>
  );
}

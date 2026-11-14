// Home page: renders every section of the portfolio in order
import HeroSection from "@/components/hero/HeroSection";
import SelectedWorkSection from "@/components/work/SelectedWorkSection";
import StatementBand from "@/components/band/StatementBand";
import WhatIBuildSection from "@/components/build/WhatIBuildSection";
import ExperienceSection from "@/components/experience/ExperienceSection";
import AboutSection from "@/components/about/AboutSection";
import ContactSection from "@/components/contact/ContactSection";

export default function HomePage() {
  return (
    <main id="top">
      <HeroSection />
      <SelectedWorkSection />
      <StatementBand />
      <WhatIBuildSection />
      <ExperienceSection />
      <AboutSection />
      <ContactSection />
    </main>
  );
}

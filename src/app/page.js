// Home page: renders every section of the portfolio in order
import HeroSection from "@/components/hero/HeroSection";
import SelectedWorkSection from "@/components/work/SelectedWorkSection";
import StatementBand from "@/components/band/StatementBand";

export default function HomePage() {
  return (
    <main id="top">
      <HeroSection />
      <SelectedWorkSection />
      <StatementBand />
    </main>
  );
}

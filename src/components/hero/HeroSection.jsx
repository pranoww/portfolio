// First screen: headline, intro and main actions with the flip business card, over layered coloured waves
import BusinessCard from "@/components/hero/BusinessCard";
import HeroWaves from "@/components/hero/HeroWaves";
import PillButton from "@/components/ui/PillButton";
import TextLink from "@/components/ui/TextLink";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { hero, profile } from "@/content/siteContent";

export default function HeroSection() {
  const [headlineStart, headlineEnd] = hero.headline.split(hero.highlightedWord);

  return (
    <section className="relative isolate overflow-hidden pb-40 pt-9 md:pb-36 md:pt-14">
      <HeroWaves />
      <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-5 sm:px-7 md:grid-cols-[8fr_4fr] md:gap-14 [&>*]:min-w-0">
        {/* The headline and intro are the first thing people read (and what speed tests measure), so they show straight away instead of fading in */}
        <div>
          <h1 className="font-display text-[clamp(40px,5.4vw,78px)] font-semibold leading-[.98] tracking-[-0.035em]">
            {headlineStart}
            <span className="bg-[linear-gradient(transparent_22%,var(--lime)_22%,var(--lime)_90%,transparent_90%)] px-[0.06em] [box-decoration-break:clone]">{hero.highlightedWord}</span>
            {headlineEnd}
          </h1>
          <p className="mt-[22px] text-lg text-ink-2 md:text-[19px]">{hero.intro}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-[26px] gap-y-4">
            <PillButton href="#work">See my work</PillButton>
            <TextLink href={profile.resumePath} download>Download resume (PDF)</TextLink>
          </div>
        </div>
        <RevealOnScroll>
          <BusinessCard />
        </RevealOnScroll>
      </div>
    </section>
  );
}

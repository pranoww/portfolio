// First screen: headline, short intro, main actions and the flip business card
import BusinessCard from "@/components/hero/BusinessCard";
import PillButton from "@/components/ui/PillButton";
import TextLink from "@/components/ui/TextLink";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { hero, profile } from "@/content/siteContent";

export default function HeroSection() {
  return (
    <section className="pb-14 pt-9 md:pb-16 md:pt-14">
      <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-4 sm:px-7 md:grid-cols-[8fr_4fr] md:gap-14 [&>*]:min-w-0">
        <RevealOnScroll>
          <h1 className="font-display text-[clamp(40px,5.4vw,78px)] font-semibold leading-[.98] tracking-[-0.035em]">{hero.headline}</h1>
          <p className="mt-[22px] text-lg text-ink-2 md:text-[19px]">{hero.intro}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-[26px] gap-y-4">
            <PillButton href="#work">See my work</PillButton>
            <TextLink href={profile.resumePath} download>Download resume (PDF)</TextLink>
          </div>
        </RevealOnScroll>
        <RevealOnScroll>
          <BusinessCard />
        </RevealOnScroll>
      </div>
    </section>
  );
}

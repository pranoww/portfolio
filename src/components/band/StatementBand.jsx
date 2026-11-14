// Black band between sections: one sentence about how I work and three small true numbers
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { statementBand } from "@/content/siteContent";

export default function StatementBand() {
  return (
    <section aria-label="How I work" className="relative overflow-hidden bg-ink py-16 text-white md:py-[76px]">
      <span aria-hidden="true" className="absolute -right-[120px] -top-[140px] size-[420px] rounded-full border border-white/10" />
      <span aria-hidden="true" className="absolute -right-10 -top-[60px] size-[260px] rounded-full border border-lime/20" />
      <div className="relative mx-auto grid max-w-[1180px] items-end gap-8 px-4 sm:px-7 md:grid-cols-[7fr_5fr] md:gap-14">
        <RevealOnScroll as="blockquote" className="font-display text-[clamp(28px,3.4vw,46px)] font-medium leading-[1.12] tracking-[-0.02em]">
          {statementBand.quoteBefore}
          <em className="not-italic text-lime">{statementBand.quoteHighlight}</em>
          {statementBand.quoteAfter}
        </RevealOnScroll>
        <RevealOnScroll>
          {statementBand.statList.map(stat => (
            <div key={stat.text} className="grid grid-cols-[90px_1fr] items-baseline gap-4 border-t border-white/20 py-4 sm:grid-cols-[110px_1fr]">
              <b className="font-display text-[46px] font-semibold leading-none tabular-nums">{stat.number}</b>
              <span className="text-[#c9cbd8]">{stat.text}</span>
            </div>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}

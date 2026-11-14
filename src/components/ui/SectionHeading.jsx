// Section header used across the page: a large title on the left and a short lead on the right
import RevealOnScroll from "@/components/ui/RevealOnScroll";

export default function SectionHeading({ title, lead }) {
  return (
    <RevealOnScroll className="mb-11 grid items-end gap-4 md:grid-cols-[5fr_7fr] md:gap-12">
      <h2 className="font-display text-[clamp(32px,4.2vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em]">{title}</h2>
      {lead && <p className="text-lg text-ink-2 md:text-[19px]">{lead}</p>}
    </RevealOnScroll>
  );
}

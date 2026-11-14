// "Experience": the One Health Assist timeline bar and two plain role columns
import ExperienceTimelineBar from "@/components/experience/ExperienceTimelineBar";
import SectionHeading from "@/components/ui/SectionHeading";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import TagPill from "@/components/ui/TagPill";
import { experience } from "@/content/siteContent";

export default function ExperienceSection() {
  return (
    <section id="experience" className="border-t border-line py-16 md:py-[76px]">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-7">
        <SectionHeading title={experience.title} lead={experience.lead} />
        <ExperienceTimelineBar />
        <div className="mt-11 grid gap-9 md:grid-cols-2 md:gap-x-14">
          {experience.roleList.map(role => (
            <RevealOnScroll as="article" key={role.title} className="border-t border-ink pt-[22px]">
              <p className="font-mono text-xs text-blue">{role.period}</p>
              <h3 className="mt-2 font-display text-2xl font-bold">{role.title}</h3>
              <ul className="mt-3.5 list-disc space-y-1.5 pl-[18px] text-ink-2">
                {role.pointList.map(point => <li key={point}>{point}</li>)}
              </ul>
              <div className="mt-[18px] flex flex-wrap items-center gap-2">
                <small className="mr-1 font-mono text-xs text-ink-2">{role.tagLabel}</small>
                {role.tagList.map(tag => <TagPill key={tag}>{tag}</TagPill>)}
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

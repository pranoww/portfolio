// Thin month-by-month bar that draws the internship, then the developer role, ending in a pulsing "Now" dot
"use client";
import { useRef } from "react";
import useElementInView from "@/hooks/useElementInView";
import { experience } from "@/content/siteContent";

export default function ExperienceTimelineBar() {
  const timelineRef = useRef(null);
  const isDrawn = useElementInView(timelineRef, { threshold: 0.6, once: true });
  const lastMonthIndex = experience.timelineMonths.length - 1;

  return (
    <div ref={timelineRef} data-testid="experience-timeline" data-drawn={isDrawn} aria-hidden="true" className="group mt-12">
      <div className="relative mb-2.5 h-[22px] font-mono text-xs">
        <span className="absolute left-0 opacity-0 transition-opacity delay-[600ms] duration-500 group-data-[drawn=true]:opacity-100">Intern</span>
        <span className="absolute left-[24.5%] opacity-0 transition-opacity delay-[1800ms] duration-500 group-data-[drawn=true]:opacity-100">Full-stack developer</span>
      </div>
      <div className="relative h-2.5 rounded-full bg-line">
        <span className="absolute inset-y-0 left-0 w-[23.5%] origin-left scale-x-0 rounded-full bg-[#9aa6ff] transition-transform duration-[1100ms] ease-[cubic-bezier(.65,0,.35,1)] group-data-[drawn=true]:scale-x-100" />
        <span className="absolute inset-y-0 left-[24.5%] w-[75.5%] origin-left scale-x-0 rounded-full bg-blue transition-transform delay-[900ms] duration-[1600ms] ease-[cubic-bezier(.65,0,.35,1)] group-data-[drawn=true]:scale-x-100" />
        <span className="absolute -right-[7px] top-1/2 -mt-[7px] size-3.5 rounded-full border-2 border-ink bg-lime opacity-0 transition-opacity delay-[2400ms] duration-400 group-data-[drawn=true]:animate-[pulse-lime_2.4s_ease-out_2.8s_infinite] group-data-[drawn=true]:opacity-100" />
      </div>
      <div className="relative mt-2.5 h-[26px] font-mono text-[11px] text-ink-2">
        {experience.timelineMonths.map((month, index) => (
          <span
            key={month}
            style={{ left: `${(index * 100) / lastMonthIndex}%` }}
            className={`absolute top-0 whitespace-nowrap ${index === 0 ? "" : index === lastMonthIndex ? "-translate-x-full" : "-translate-x-1/2 max-md:[&:nth-child(even)]:hidden"}`}
          >
            {month}
          </span>
        ))}
      </div>
    </div>
  );
}

// "Speed and search" demo: a checklist of real page-speed fixes ticking off one by one
"use client";
import useLoopingSequence from "@/hooks/useLoopingSequence";
import { speedChecklist } from "@/content/siteContent";

export default function SpeedChecklistDemo({ isActive }) {
  const checkedItemCount = useLoopingSequence(isActive, speedChecklist.length, { startDelay: 350, stepDelay: 450, pauseAfterLastStep: 2600 });

  return (
    <ul className="grid w-full gap-3 sm:grid-cols-2 sm:gap-x-[22px]">
      {speedChecklist.map((checklistItem, index) => (
        <li
          key={checklistItem}
          data-shown={index < checkedItemCount}
          className="group flex items-center gap-2.5 rounded-xl border border-line bg-bg px-4 py-3.5 text-ink-2 transition-colors duration-300 data-[shown=true]:border-ink data-[shown=true]:bg-white data-[shown=true]:text-ink"
        >
          <i className="relative size-5 flex-none rounded-full border-[1.5px] border-[#c9cbd8] transition-colors duration-300 group-data-[shown=true]:border-blue group-data-[shown=true]:bg-blue after:absolute after:left-1.5 after:top-[3px] after:hidden after:h-[9px] after:w-[5px] after:rotate-45 after:border-white after:border-b-2 after:border-r-2 group-data-[shown=true]:after:block" />
          {checklistItem}
        </li>
      ))}
    </ul>
  );
}

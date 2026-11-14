// "AI features" demo: a skin-care question gets an answer typed word by word, then safety and voice badges appear
"use client";
import useLoopingSequence from "@/hooks/useLoopingSequence";
import { aiChatExample } from "@/content/siteContent";

const answerWordList = aiChatExample.answer.split(" ");

export default function AiChatDemo({ isActive }) {
  const shownStepCount = useLoopingSequence(isActive, answerWordList.length + 1, { startDelay: 600, stepDelay: 75, pauseAfterLastStep: 3800 });
  const areBadgesShown = shownStepCount > answerWordList.length;

  return (
    <div className="grid w-full gap-3.5 text-[15px] sm:text-[17px]">
      <p className="max-w-[85%] justify-self-end rounded-[14px_14px_4px_14px] bg-white px-3.5 py-2.5 text-ink">{aiChatExample.question}</p>
      <p className="min-h-[110px] max-w-[92%] rounded-[14px_14px_14px_4px] bg-white/15 px-3.5 py-3 leading-normal">
        <span data-testid="ai-answer">{answerWordList.slice(0, shownStepCount).join(" ")}</span>
        <span aria-hidden="true" className="ml-0.5 inline-block h-[15px] w-[7px] animate-[caret-blink_.8s_steps(2)_infinite] bg-lime align-[-2px]" />
      </p>
      <div className="flex flex-wrap gap-2 transition-opacity duration-400" style={{ opacity: areBadgesShown ? 1 : 0 }}>
        {aiChatExample.badgeList.map((badge, index) => (
          <span key={badge} className={`rounded-full px-2.5 py-1 font-mono text-[11px] ${index === 0 ? "bg-lime text-ink" : "bg-white/20 text-white"}`}>{badge}</span>
        ))}
      </div>
    </div>
  );
}

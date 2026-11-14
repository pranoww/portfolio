// Hero business card: tilts toward the cursor with a moving shine, flips in 3D to show details, shows live Mumbai time
"use client";
import { useEffect, useRef, useState } from "react";
import { hero, profile } from "@/content/siteContent";

const cardFaceClassName =
  "absolute inset-0 flex flex-col overflow-hidden rounded-[20px] p-5 text-white backface-hidden shadow-[0_30px_60px_-20px_rgba(26,47,251,.45),0_10px_20px_-10px_rgba(0,0,0,.25)] sm:p-[30px] " +
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:mix-blend-soft-light after:bg-[radial-gradient(320px_circle_at_var(--shine-x,30%)_var(--shine-y,20%),rgba(255,255,255,.55),transparent_55%)]";

const quotedString = text => <span className="text-lime">&quot;{text}&quot;</span>;

const codeValueByType = {
  string: value => quotedString(value),
  boolean: value => <span className="text-[#8fa0ff]">{value ? "True" : "False"}</span>,
  object: value => <>[{value.map((item, index) => <span key={item}>{index > 0 && ", "}{quotedString(item)}</span>)}]</>,
};

const codeLineList = [
  <><span className="text-white">{hero.cardCode.variableName}</span> = {"{"}</>,
  ...hero.cardCode.entryList.map(entry => (
    <>{"  "}<span className="text-[#dfe3ff]">&quot;{entry.key}&quot;</span>: {codeValueByType[typeof entry.value](entry.value)},</>
  )),
  "}",
];

const mumbaiTimeFormat =new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: profile.timeZone });

export default function BusinessCard() {
  const cardRef = useRef(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mumbaiTime, setMumbaiTime] = useState("--:--");

  useEffect(() => {
    const updateMumbaiTime = () => setMumbaiTime(mumbaiTimeFormat.format(new Date()));
    updateMumbaiTime();
    const clockInterval = setInterval(updateMumbaiTime, 15_000);
    return () => clearInterval(clockInterval);
  }, []);

  function handleCardClick(event) {
    if (!event.target.closest("a")) setIsFlipped(!isFlipped);
  }

  function handleCardKeyDown(event) {
    if ((event.key === "Enter" || event.key === " ") && !event.target.closest("a")) {
      event.preventDefault();
      setIsFlipped(!isFlipped);
    }
  }

  function handlePointerMove(event) {
    if (event.pointerType !== "mouse") return;
    const card = cardRef.current;
    const bounds = card.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width;
    const vertical = (event.clientY - bounds.top) / bounds.height;
    card.style.transform = `rotateX(${((0.5 - vertical) * 14).toFixed(2)}deg) rotateY(${((horizontal - 0.5) * 18).toFixed(2)}deg)`;
    card.style.setProperty("--shine-x", `${(isFlipped ? 1 - horizontal : horizontal) * 100}%`);
    card.style.setProperty("--shine-y", `${vertical * 100}%`);
  }

  function handlePointerLeave() {
    cardRef.current.style.transform = "";
  }

  return (
    <div className="w-full min-w-0 self-center perspective-[1200px] max-md:max-w-[460px]">
      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        aria-pressed={isFlipped}
        aria-label="Business card. Press to flip for details."
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative h-[380px] w-full cursor-pointer rounded-[20px] transform-3d transition-transform duration-150 ease-out sm:h-[440px]"
      >
        <div className={`absolute inset-0 transform-3d transition-transform duration-[900ms] ease-[cubic-bezier(.65,0,.35,1)] ${isFlipped ? "rotate-y-180" : ""}`}>
          <div className={`${cardFaceClassName} bg-[radial-gradient(130%_100%_at_0%_0%,#4054ff_0%,var(--blue)_45%,var(--blue-d)_100%)]`}>
            <div className="flex items-start justify-between">
              <span className="font-mono text-xs text-[#dfe3ff]">{profile.handle}</span>
              <span aria-hidden="true" className="relative h-[26px] w-[34px] rounded-md bg-[linear-gradient(135deg,var(--lime),#8fd400)] before:absolute before:inset-x-1.5 before:top-[9px] before:h-px before:bg-black/35 after:absolute after:inset-x-1.5 after:top-[15px] after:h-px after:bg-black/35" />
            </div>
            <p className="mt-auto font-display text-[clamp(34px,3.2vw,48px)] font-semibold leading-[.98] tracking-[-0.03em]">
              Pranav<br />Lande
            </p>
            <p className="mt-2 text-[#dfe3ff]">{profile.role}</p>
            <div className="mt-[18px] flex items-center justify-between border-t border-white/20 pt-3.5 font-mono text-xs text-[#dfe3ff]">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="size-2 animate-[pulse-lime_2s_ease-out_infinite] rounded-full bg-lime" />
                {profile.location} · <span data-testid="mumbai-clock">{mumbaiTime}</span> IST
              </span>
              <span>Flip ↻</span>
            </div>
          </div>

          <div className={`${cardFaceClassName} rotate-y-180 bg-[radial-gradient(110%_80%_at_100%_100%,#2236ff_0%,#111a6b_38%,#070a1f_78%)]`}>
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <span aria-hidden="true" className="flex gap-1.5">
                {["bg-[#ff5f57]", "bg-[#febc2e]", "bg-lime"].map(dotColor => <i key={dotColor} className={`size-2.5 rounded-full ${dotColor}`} />)}
              </span>
              <p className="flex items-center gap-2 rounded-md bg-white/[.08] px-2.5 py-1 font-mono text-xs text-white/85">
                <span aria-hidden="true" className="font-bold text-[#8fa0ff]">py</span>{hero.cardCode.fileName}
              </p>
            </div>
            <pre className="mt-4 font-mono text-[12px] leading-[1.9] text-white/45 sm:text-[13px]">
              {codeLineList.map((codeLine, index) => (
                <span key={index} className="block">
                  <span aria-hidden="true" className="inline-block w-7 select-none text-white/25">{index + 1}</span>{codeLine}
                  {index === codeLineList.length - 1 && <span aria-hidden="true" className="ml-0.5 inline-block h-[1.1em] w-[2px] animate-[caret-blink_1s_steps(1)_infinite] bg-lime align-middle" />}
                </span>
              ))}
            </pre>
            <div className="mt-auto flex flex-wrap gap-2">
              {[
                { label: "GitHub", href: profile.githubUrl },
                { label: "LinkedIn", href: profile.linkedinUrl },
                { label: "Resume", href: profile.resumePath, download: true },
              ].map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  download={link.download}
                  {...(link.href.startsWith("http") && { target: "_blank", rel: "noreferrer" })}
                  className="relative z-10 rounded-full bg-white/10 px-3 py-[7px] font-mono text-xs text-white transition-colors hover:bg-lime hover:text-ink"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <p aria-hidden="true" className="-mx-5 -mb-5 mt-4 flex justify-between bg-blue px-5 py-1.5 font-mono text-[10px] text-white/85 sm:-mx-[30px] sm:-mb-[30px] sm:px-[30px]">
              <span>⎇ main</span>
              <span>Python · Ln {codeLineList.length}, Col 2</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

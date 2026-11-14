// One "What I build" stage panel: coloured backdrop, big number, stack line and its live demo, with a cursor spotlight
"use client";
import { useRef } from "react";
import useElementInView from "@/hooks/useElementInView";
import ResponsiveBrowserDemo from "@/components/build/ResponsiveBrowserDemo";
import ApiRequestLogDemo from "@/components/build/ApiRequestLogDemo";
import AiChatDemo from "@/components/build/AiChatDemo";
import SpeedChecklistDemo from "@/components/build/SpeedChecklistDemo";

const demoComponentByName = { web: ResponsiveBrowserDemo, api: ApiRequestLogDemo, ai: AiChatDemo, speed: SpeedChecklistDemo };

const panelStyleByDemo = {
  web: { panelClassName: "border border-line bg-surface text-ink", spotlightColor: "rgba(26,47,251,.07)", numberOpacity: "opacity-[.07]" },
  api: { panelClassName: "bg-ink text-white", spotlightColor: "rgba(255,255,255,.10)", numberOpacity: "opacity-[.12]" },
  ai: { panelClassName: "bg-[radial-gradient(120%_100%_at_20%_0%,#3346ff,var(--blue)_55%,var(--blue-d))] text-white", spotlightColor: "rgba(255,255,255,.10)", numberOpacity: "opacity-[.12]" },
  speed: { panelClassName: "border border-line bg-surface text-ink", spotlightColor: "rgba(26,47,251,.07)", numberOpacity: "opacity-[.07]" },
};

export default function BuildDemoPanel({ buildItem, isDesktop, isActiveOnDesktop, desktopStateClassName }) {
  const panelRef = useRef(null);
  const isInView = useElementInView(panelRef, { threshold: 0.4 });
  const isActive = isDesktop ? isActiveOnDesktop : isInView;
  const DemoComponent = demoComponentByName[buildItem.demo];
  const panelStyle = panelStyleByDemo[buildItem.demo];

  function handlePointerMove(event) {
    const bounds = panelRef.current.getBoundingClientRect();
    panelRef.current.style.setProperty("--spotlight-x", `${event.clientX - bounds.left}px`);
    panelRef.current.style.setProperty("--spotlight-y", `${event.clientY - bounds.top}px`);
  }

  return (
    <div
      ref={panelRef}
      onPointerMove={handlePointerMove}
      style={{ "--spotlight-color": panelStyle.spotlightColor }}
      className={`relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-[22px] p-5 sm:min-h-[460px] sm:p-[34px] md:rounded-[26px] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(420px_circle_at_var(--spotlight-x,50%)_var(--spotlight-y,30%),var(--spotlight-color),transparent_60%)] ${panelStyle.panelClassName} ${desktopStateClassName}`}
    >
      <span className="absolute left-5 top-5 font-mono text-xs opacity-70 sm:left-[34px] sm:top-[26px]">{buildItem.stackLine}</span>
      <span aria-hidden="true" className={`absolute right-[26px] top-3.5 font-display text-[80px] font-semibold leading-none tracking-[-0.04em] sm:text-[120px] ${panelStyle.numberOpacity}`}>{buildItem.number}</span>
      {!isDesktop && (
        <div className="mb-auto pt-[30px]">
          <h3 className="font-display text-[26px] font-bold">{buildItem.title}</h3>
          <p className="mt-1.5 opacity-80">{buildItem.description}</p>
        </div>
      )}
      <div className="relative mt-6">
        <DemoComponent isActive={isActive} />
      </div>
    </div>
  );
}

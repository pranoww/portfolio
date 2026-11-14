// "What I build": on desktop the section pins while you scroll, swapping one live demo at a time; on phones the demos stack
"use client";
import { useEffect, useRef, useState } from "react";
import BuildDemoPanel from "@/components/build/BuildDemoPanel";
import { buildItemList } from "@/content/siteContent";

const headerHeight = 68;

export default function WhatIBuildSection() {
  const storyRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 901px)");
    const updateIsDesktop = () => setIsDesktop(desktopQuery.matches);
    updateIsDesktop();
    desktopQuery.addEventListener("change", updateIsDesktop);
    return () => desktopQuery.removeEventListener("change", updateIsDesktop);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    let isFrameRequested = false;
    function updateStoryProgress() {
      isFrameRequested = false;
      const story = storyRef.current;
      const scrollableDistance = story.offsetHeight - (window.innerHeight - headerHeight);
      const progress = Math.min(1, Math.max(0, (headerHeight - story.getBoundingClientRect().top) / scrollableDistance));
      setScrollProgress(progress);
      setActiveIndex(Math.min(buildItemList.length - 1, Math.floor(progress * buildItemList.length * 0.999)));
    }
    function requestProgressUpdate() {
      if (!isFrameRequested) { isFrameRequested = true; requestAnimationFrame(updateStoryProgress); }
    }
    updateStoryProgress();
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate);
    return () => {
      window.removeEventListener("scroll", requestProgressUpdate);
      window.removeEventListener("resize", requestProgressUpdate);
    };
  }, [isDesktop]);

  function scrollToBuildItem(index) {
    const story = storyRef.current;
    const scrollableDistance = story.offsetHeight - (window.innerHeight - headerHeight);
    const storyTop = story.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top: storyTop + (scrollableDistance * (index + 0.5)) / buildItemList.length, behavior: "smooth" });
  }

  if (!isDesktop) {
    return (
      <section id="build" className="border-t border-line py-[88px]">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-7">
          <h2 className="mb-7 font-display text-[clamp(32px,4.2vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em]">What I build</h2>
          <div className="grid gap-[22px]">
            {buildItemList.map(buildItem => <BuildDemoPanel key={buildItem.demo} buildItem={buildItem} isDesktop={false} />)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="build" className="border-t border-line">
      <div ref={storyRef} className="relative mx-auto h-[420vh] max-w-[1180px] px-7">
        <div className="sticky top-[var(--header-height)] grid h-[calc(100vh-var(--header-height))] grid-cols-[5fr_7fr] items-center gap-14">
          <div className="relative pl-[26px]">
            <span className="absolute bottom-1.5 left-0 top-1.5 w-0.5 rounded bg-line" />
            <span className="absolute left-0 top-1.5 w-0.5 rounded bg-blue" style={{ height: `calc(${(scrollProgress * 100).toFixed(2)}% - 12px)` }} />
            <h2 className="mb-[30px] font-display text-[clamp(32px,4.2vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em]">What I build</h2>
            {buildItemList.map((buildItem, index) => {
              const isActiveItem = index === activeIndex;
              return (
                <button key={buildItem.demo} type="button" onClick={() => scrollToBuildItem(index)} aria-current={isActiveItem} className="block w-full py-3.5 text-left">
                  <span className="flex items-baseline gap-3.5">
                    <span className={`font-mono text-xs transition-colors duration-400 ${isActiveItem ? "text-blue" : "text-[#9ea2b3]"}`}>{buildItem.number}</span>
                    <span className={`font-display font-bold transition-all duration-500 ${isActiveItem ? "text-[32px] text-ink" : "text-2xl text-[#a4a8b8]"}`}>{buildItem.title}</span>
                  </span>
                  <span className={`grid transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${isActiveItem ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <span className="overflow-hidden pl-[30px]">
                      <span className="mt-2 block text-ink-2">{buildItem.description}</span>
                      <span className="mt-2.5 block font-mono text-xs text-ink-2">
                        {buildItem.proofPrefix} {buildItem.proofList.map((proof, proofIndex) => (
                          <span key={proof}>
                            <b className="font-medium text-ink underline decoration-blue underline-offset-[3px]">{proof}</b>{proofIndex < buildItem.proofList.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative h-[min(560px,calc(100vh-160px))]">
            {buildItemList.map((buildItem, index) => {
              const panelPosition = index === activeIndex ? "opacity-100 blur-0" : index < activeIndex ? "pointer-events-none -translate-y-9 scale-[.98] opacity-0 blur-sm" : "pointer-events-none translate-y-12 scale-[.96] opacity-0 blur-md";
              return (
                <BuildDemoPanel
                  key={buildItem.demo}
                  buildItem={buildItem}
                  isDesktop
                  isActiveOnDesktop={index === activeIndex}
                  desktopStateClassName={`!absolute inset-0 h-full transition-[opacity,transform,filter] duration-[800ms] ease-[cubic-bezier(.22,1,.36,1)] ${panelPosition}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

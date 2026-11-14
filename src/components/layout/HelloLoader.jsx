// First-visit intro: cycles "Hello" in several languages, then slides away. Shown once per browser session.
"use client";
import { useEffect, useState } from "react";
import { helloWords } from "@/content/siteContent";

const firstWordDelay = 420;
const wordDelay = 230;
const lastWordDelay = 650;
const slideAwayDuration = 700;

export default function HelloLoader() {
  const [wordIndex, setWordIndex] = useState(0);
  const [isSlidingAway, setIsSlidingAway] = useState(false);

  useEffect(() => {
    const rootElement = document.documentElement;
    if (!rootElement.classList.contains("is-loading")) return;

    let wordTimer;
    let hideTimer;
    let isFinished = false;

    function finishIntro() {
      if (isFinished) return;
      isFinished = true;
      clearTimeout(wordTimer);
      try { sessionStorage.setItem("pl-hello", "1"); } catch {}
      setIsSlidingAway(true);
      hideTimer = setTimeout(() => rootElement.classList.remove("is-loading"), slideAwayDuration);
    }

    function showNextWord(nextIndex) {
      if (nextIndex >= helloWords.length) return finishIntro();
      setWordIndex(nextIndex);
      wordTimer = setTimeout(() => showNextWord(nextIndex + 1), nextIndex === helloWords.length - 1 ? lastWordDelay : wordDelay);
    }

    wordTimer = setTimeout(() => showNextWord(1), firstWordDelay);
    window.addEventListener("keydown", finishIntro);
    return () => {
      clearTimeout(wordTimer);
      clearTimeout(hideTimer);
      window.removeEventListener("keydown", finishIntro);
    };
  }, []);

  function handleSkipClick() {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  }

  return (
    <div
      className={`fixed inset-0 z-[100] hidden items-center justify-center bg-ink font-display text-[clamp(44px,8vw,96px)] font-semibold tracking-[-0.02em] text-white transition-transform duration-700 ease-[cubic-bezier(.76,0,.24,1)] [.is-loading_&]:flex ${isSlidingAway ? "-translate-y-full" : ""}`}
    >
      <span aria-hidden="true" className="mr-[.35em] size-[.24em] rounded-full bg-lime" />
      <span aria-hidden="true">{helloWords[wordIndex]}</span>
      <button
        type="button"
        onClick={handleSkipClick}
        className="absolute bottom-6 right-7 rounded-full border border-white/30 px-3.5 py-2 font-display text-sm font-semibold text-line"
      >
        Skip intro
      </button>
    </div>
  );
}

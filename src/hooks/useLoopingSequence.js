// Reveals a number of steps one after another while active, pauses, then starts again; drives the "What I build" demos
"use client";
import { useEffect, useState } from "react";

export default function useLoopingSequence(isActive, stepCount, { startDelay, stepDelay, pauseAfterLastStep }) {
  const [shownStepCount, setShownStepCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    let sequenceTimer;
    function playStep(stepNumber) {
      setShownStepCount(stepNumber);
      if (stepNumber < stepCount) sequenceTimer = setTimeout(() => playStep(stepNumber + 1), stepDelay);
      else sequenceTimer = setTimeout(() => playStep(0), pauseAfterLastStep);
    }
    sequenceTimer = setTimeout(() => playStep(1), startDelay);
    return () => {
      clearTimeout(sequenceTimer);
      setShownStepCount(0);
    };
  }, [isActive, stepCount, startDelay, stepDelay, pauseAfterLastStep]);

  return shownStepCount;
}

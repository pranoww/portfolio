// Smooth scrolling for mouse and trackpad users via Lenis; in-page links glide to their section below the header
"use client";
import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScrollProvider({ children }) {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-height"), 10);
    const lenis = new Lenis({ autoRaf: true, anchors: { offset: -headerHeight }, lerp: 0.1 });
    return () => lenis.destroy();
  }, []);

  return children;
}

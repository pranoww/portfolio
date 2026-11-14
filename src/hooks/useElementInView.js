// Tells a component whether its element is on screen, used for reveals and demos that play only when visible
"use client";
import { useEffect, useState } from "react";

export default function useElementInView(elementRef, { threshold = 0.15, once = false } = {}) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
      if (entry.isIntersecting && once) observer.disconnect();
    }, { threshold });
    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef, threshold, once]);

  return isInView;
}

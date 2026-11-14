// The site's single reveal effect: content fades and slides up once when it first scrolls into view
"use client";
import { useRef } from "react";
import useElementInView from "@/hooks/useElementInView";

export default function RevealOnScroll({ as: Element = "div", className = "", children, ...otherProps }) {
  const elementRef = useRef(null);
  const isRevealed = useElementInView(elementRef, { threshold: 0.12, once: true });

  return (
    <Element
      ref={elementRef}
      data-revealed={isRevealed}
      className={`transition duration-700 ease-[cubic-bezier(.22,1,.36,1)] data-[revealed=false]:translate-y-4 data-[revealed=false]:opacity-0 ${className}`}
      {...otherProps}
    >
      {children}
    </Element>
  );
}

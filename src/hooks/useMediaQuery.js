// Tells whether a CSS media query matches right now, updating when the screen changes; false until the page loads in the browser
"use client";
import { useEffect, useState } from "react";

export default function useMediaQuery(query) {
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const updateIsMatching = () => setIsMatching(mediaQuery.matches);
    updateIsMatching();
    mediaQuery.addEventListener("change", updateIsMatching);
    return () => mediaQuery.removeEventListener("change", updateIsMatching);
  }, [query]);

  return isMatching;
}

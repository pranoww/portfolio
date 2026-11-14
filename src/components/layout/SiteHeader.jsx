// Sticky top bar: name, section links, resume and contact; collapses into a menu on small screens
"use client";
import { useEffect, useState } from "react";
import PillButton from "@/components/ui/PillButton";
import { navigationLinks, profile } from "@/content/siteContent";

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    function closeMenuOnEscape(event) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }
    window.addEventListener("keydown", closeMenuOnEscape);
    return () => window.removeEventListener("keydown", closeMenuOnEscape);
  }, []);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-20 h-[var(--header-height)] border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1180px] items-center justify-between px-4 sm:px-7">
        <a href="#top" className="flex items-center gap-2.5 font-display text-xl font-bold">
          <span aria-hidden="true" className="size-3 rounded-full bg-blue" />
          {profile.name}
        </a>

        <button
          type="button"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="site-navigation"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex size-11 items-center justify-center rounded-full border border-line bg-surface md:hidden"
        >
          <span aria-hidden="true" className="relative block h-0.5 w-[18px] bg-ink before:absolute before:-top-1.5 before:left-0 before:h-0.5 before:w-[18px] before:bg-ink after:absolute after:top-1.5 after:left-0 after:h-0.5 after:w-[18px] after:bg-ink" />
        </button>

        <nav
          id="site-navigation"
          className={`${isMenuOpen ? "flex" : "hidden"} absolute inset-x-0 top-[var(--header-height)] flex-col border-b border-line bg-bg px-4 pb-5 pt-2 md:static md:flex md:flex-row md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0`}
        >
          {navigationLinks.map(link => (
            <a key={link.href} href={link.href} onClick={closeMenu} className="flex min-h-11 items-center border-b border-line font-medium hover:text-blue md:min-h-0 md:border-0">
              {link.label}
            </a>
          ))}
          <a href={profile.resumePath} download onClick={closeMenu} className="flex min-h-11 items-center border-b border-line font-medium hover:text-blue md:min-h-0 md:border-0">
            Resume
          </a>
          <PillButton href="#contact" onClick={closeMenu} className="mt-3.5 md:mt-0 md:min-h-10 md:px-4 md:py-1.5 md:text-[15px]">
            Get in touch
          </PillButton>
        </nav>
      </div>
    </header>
  );
}

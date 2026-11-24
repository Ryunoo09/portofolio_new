"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/features/motion/hooks/use-prefers-reduced-motion";

/** Past this much scroll the dock shrinks; past 120 px it may also hide. */
const SHRINK_AT = 50;
const HIDE_AT = 120;

export function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;

      setScrolled(currentScrollY > SHRINK_AT);

      if (currentScrollY > HIDE_AT && currentScrollY > lastScrollY) {
        setHidden(true);
      } else if (currentScrollY < lastScrollY) {
        setHidden(false);
      }

      lastScrollY = currentScrollY;
    };

    // A reload can start mid-page; read the position once before listening.
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reducedMotion]);

  return reducedMotion ? { hidden: false, scrolled: false } : { hidden, scrolled };
}

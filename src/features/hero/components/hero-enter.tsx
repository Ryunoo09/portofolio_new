"use client";

import { useLayoutEffect } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * Starts the hero entrance once the preloader is gone.
 *
 * The section is server-rendered and fully visible by default; `data-entered`
 * only switches the CSS animation on, so a failed script can never leave the
 * copy hidden. A repeat visit has no overlay and starts at hydration.
 */
export function HeroEnter() {
  useLayoutEffect(() => {
    const section = document.getElementById("home");

    if (!section) return;

    // jsdom and very old browsers have no `matchMedia`; motion is then allowed,
    // which is exactly what the tests want.
    const query = typeof window.matchMedia === "function" ? window.matchMedia(REDUCED) : null;

    if (query?.matches) return;

    const start = () => {
      section.dataset.entered = "";
    };

    if (!document.querySelector(".preloader")) {
      start();
      return;
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(".preloader")) return;

      observer.disconnect();
      start();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}

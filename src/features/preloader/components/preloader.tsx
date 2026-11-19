"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/** Once per browser session: the first visit pays for the intro, then never again. */
export const PRELOADER_KEY = "preloader-seen";

/** PRD US-02: 0.8-2.0 s including the exit, so a slow device cannot stretch it. */
const DURATION_MS = 1200;
const TICK_MS = 100;
const STEPS = Math.ceil(DURATION_MS / TICK_MS);

/**
 * Hydration flag. False for the server render and for hydration, so the overlay
 * only ever exists in a browser that runs JavaScript.
 */
const subscribe = () => () => {};

function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

function alreadySeen(): boolean {
  try {
    return sessionStorage.getItem(PRELOADER_KEY) !== null;
  } catch {
    // Storage can be blocked (private mode, policy); treat it as "not seen" and
    // let the overlay run rather than throwing in the middle of a render.
    return false;
  }
}

function skip(): boolean {
  return prefersReducedMotion() || alreadySeen();
}

/**
 * Visual-only preloader (US-02). It covers the page for a moment, then removes
 * itself from the DOM.
 *
 * Nothing here gates content: the page is server-rendered and already readable
 * underneath, so this is decoration over it, not a loading step. With JavaScript
 * off nothing is ever inserted, and reduced motion skips it entirely.
 */
export function Preloader() {
  const hydrated = useHydrated();
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState(0);

  // Derived during render, not set from an effect: the page is rendered three
  // times (server, hydration, client) and only the third can show the overlay.
  const visible = hydrated && !dismissed && !skip();

  useEffect(() => {
    if (!visible) return;

    try {
      sessionStorage.setItem(PRELOADER_KEY, "1");
    } catch {
      // Blocked storage only means the intro may repeat; never a crash.
    }

    const ticker = window.setInterval(() => setStep((value) => Math.min(STEPS, value + 1)), TICK_MS);
    const done = window.setTimeout(() => setDismissed(true), DURATION_MS);

    return () => {
      window.clearInterval(ticker);
      window.clearTimeout(done);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div aria-hidden="true" className="preloader">
      <p className="preloader-count font-mono text-xs tracking-[0.2em]">
        {Math.round((step / STEPS) * 100)}%
      </p>
    </div>
  );
}

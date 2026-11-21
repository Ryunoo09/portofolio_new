"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/** Once per browser session: the first visit pays for the intro, then never again. */
export const PRELOADER_KEY = "preloader-seen";

/** PRD US-02: 0.8-2.0 s including the exit, so a slow device cannot stretch it. */
const DURATION_MS = 1200;
const TICK_MS = 100;
const STEPS = Math.ceil(DURATION_MS / TICK_MS);
const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const WORDMARK = "Rakhadev";

function decodeWordmark(progress: number): string {
  const fixed = Math.min(WORDMARK.length, Math.ceil((progress / 100) * WORDMARK.length));
  return WORDMARK.split("")
    .map((letter, index) => {
      if (index < fixed || progress === 100) return letter;
      return SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
    })
    .join("");
}

const EXIT_MS = 240;
const PRELOADER_DURATION_MS = DURATION_MS + EXIT_MS;

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
  const progress = Math.round((step / STEPS) * 100);
  const wordmark = decodeWordmark(progress);

  // Derived during render, not set from an effect: the page is rendered three
  // times (server, hydration, client) and only the third can show the overlay.
  const visible = hydrated && !dismissed && !skip();

  useEffect(() => {
    if (!visible) return;

    const ticker = window.setInterval(() => setStep((value) => Math.min(STEPS, value + 1)), TICK_MS);
    const done = window.setTimeout(() => setStep(STEPS), DURATION_MS);
    const dismiss = window.setTimeout(() => {
      // Mark the session only now: writing it up front makes `skip()` true on
      // the next render, which removed the overlay after ~100 ms.
      try {
        sessionStorage.setItem(PRELOADER_KEY, "1");
      } catch {
        // Blocked storage only means the intro may repeat; never a crash.
      }

      setDismissed(true);
    }, PRELOADER_DURATION_MS);

    return () => {
      window.clearInterval(ticker);
      window.clearTimeout(done);
      window.clearTimeout(dismiss);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="preloader" role="status" aria-label="Loading portfolio">
      <span className="preloader-wordmark" aria-hidden="true">{wordmark}</span>
      <div className="preloader-progress" role="progressbar" aria-label="Intro animation progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
        <span className="preloader-progress-fill" style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
      <p aria-hidden="true" className="preloader-count font-mono text-xs tracking-[0.2em]">
        {progress}%
      </p>
    </div>
  );
}

"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/** jsdom and very old browsers have no `matchMedia`; motion is then allowed. */
function query(): MediaQueryList | null {
  return typeof window.matchMedia === "function" ? window.matchMedia(QUERY) : null;
}

function subscribe(onChange: () => void) {
  const list = query();

  if (!list) return () => {};

  list.addEventListener("change", onChange);

  return () => list.removeEventListener("change", onChange);
}

function getSnapshot() {
  return query()?.matches ?? false;
}

function getServerSnapshot() {
  return false;
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

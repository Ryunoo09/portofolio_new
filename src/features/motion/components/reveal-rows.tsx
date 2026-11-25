"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../hooks/use-prefers-reduced-motion";
import { revealOnScroll } from "../lib/reveal";

type RevealRowsProps = {
  /** Selector for the elements that animate, relative to this wrapper. */
  selector: string;
  /** Pixels of upward travel. Sections vary it so the page does not feel uniform. */
  distance?: number;
  /** Seconds. Kept inside the PRD's 300-800 ms window. */
  duration?: number;
  /** Seconds between two rows. */
  stagger?: number;
  children: ReactNode;
};

/**
 * Reveals a block's rows in turn as they scroll in (US-08).
 *
 * The wrapper is `display: contents`, so it contributes no box: margins and grid
 * placement stay exactly as the server rendered them, and the rows are already in
 * the HTML for crawlers and for anyone without JavaScript.
 *
 * Only `opacity` and `transform` animate, once per row, starting when the block's
 * top reaches 85% of the viewport (a 15% margin). Reduced motion leaves the rows
 * untouched.
 */
export function RevealRows({
  selector,
  distance = 16,
  duration = 0.6,
  stagger = 0.08,
  children,
}: RevealRowsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const root = ref.current;

    if (!root || reducedMotion) return;

    const rows = [...root.querySelectorAll<HTMLElement>(selector)];

    if (rows.length === 0) return;

    // The wrapper is `display: contents`, so it has no geometry of its own:
    // ScrollTrigger would measure it as a zero-height box at the top of the page
    // and fire on load. The first row is a real box, so it is the trigger.
    return revealOnScroll({ targets: rows, trigger: rows[0], distance, duration, stagger });
  }, [distance, duration, reducedMotion, selector, stagger]);

  return (
    <div ref={ref} style={{ display: "contents" }} data-reveal-root="">
      {children}
    </div>
  );
}

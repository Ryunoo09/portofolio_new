"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { loadGsap, usePrefersReducedMotion } from "@/features/motion";

type RevealRowsProps = {
  /** Selector for the elements that animate, relative to this wrapper. */
  selector: string;
  children: ReactNode;
};

const HIDDEN = { opacity: "0", transform: "translateY(16px)" };

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
 *
 * GSAP is imported on demand, so the rows stay visible until the effect actually
 * takes over: the starting styles are only written to rows that begin below the
 * fold (otherwise the flip happens off screen and nothing seems to animate).
 */
export function RevealRows({ selector, children }: RevealRowsProps) {
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
    const trigger = rows[0];

    const pending = rows.filter(
      (element) => element.getBoundingClientRect().top > window.innerHeight * 0.85,
    );

    if (pending.length === 0) return;

    for (const element of pending) Object.assign(element.style, HIDDEN);

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    void loadGsap().then(({ gsap }) => {
      if (cancelled || !root.isConnected) return;

      const context = gsap.context(() => {
        gsap.to(pending, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.08,
          clearProps: "opacity,transform",
          scrollTrigger: { trigger, start: "top 85%", once: true },
        });
      }, root);

      cleanup = () => context.revert();
    });

    return () => {
      cancelled = true;
      cleanup?.();

      // A cancelled import or a removed component must never leave a row hidden.
      for (const element of pending) {
        element.style.removeProperty("opacity");
        element.style.removeProperty("transform");
      }
    };
  }, [reducedMotion, selector]);

  return (
    <div ref={ref} style={{ display: "contents" }} data-reveal-root="">
      {children}
    </div>
  );
}

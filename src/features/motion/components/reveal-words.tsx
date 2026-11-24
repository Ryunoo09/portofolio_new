"use client";

import { Fragment, type CSSProperties, useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../hooks/use-prefers-reduced-motion";
import { revealOnScroll } from "../lib/reveal";

type RevealWordsProps = {
  text: string;
  /** Pixels of upward travel. */
  distance?: number;
  /** Seconds. */
  duration?: number;
  /** Seconds between two words. */
  stagger?: number;
};

/**
 * Splits a heading into words that rise in one after another (US-08).
 *
 * Words are real text nodes separated by real spaces, all of them rendered on the
 * server, so the heading keeps its accessible name, its line wrapping, and its
 * text for crawlers. No library: the split is `text.split`.
 *
 * `--word-index` is published per word so a CSS entrance (the hero, which sits
 * above the fold and is not scroll-triggered) can stagger without JavaScript.
 */
export function RevealWords({
  text,
  distance = 14,
  duration = 0.5,
  stagger = 0.04,
}: RevealWordsProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const words = text.split(/\s+/).filter(Boolean);

  useEffect(() => {
    const root = ref.current;

    if (!root || reducedMotion) return;

    const targets = [...root.querySelectorAll<HTMLElement>("[data-word]")];

    if (targets.length === 0) return;

    return revealOnScroll({ targets, trigger: root, distance, duration, stagger });
  }, [distance, duration, reducedMotion, stagger, text]);

  return (
    <span ref={ref} data-reveal-words="">
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span
            className="reveal-word"
            data-word=""
            style={{ "--word-index": index } as CSSProperties}
          >
            {word}
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}

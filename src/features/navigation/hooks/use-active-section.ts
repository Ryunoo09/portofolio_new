"use client";

import { useEffect, useState } from "react";
import type { SectionId } from "@/lib/sections";

/**
 * Tracks which section owns the top of the viewport. Returns null before the
 * observer reports, so nothing is marked active on first paint.
 */
export function useActiveSection(ids: readonly SectionId[]): SectionId | null {
  const [active, setActive] = useState<SectionId | null>(null);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0 || !("IntersectionObserver" in window)) return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio);
          else visible.delete(entry.target.id);
        }

        // The section highest in the document wins, so a short section that is
        // barely visible never steals the highlight from the one being read.
        const next = ids.find((id) => visible.has(id));
        setActive(next ?? null);
      },
      { rootMargin: "-20% 0px -40% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

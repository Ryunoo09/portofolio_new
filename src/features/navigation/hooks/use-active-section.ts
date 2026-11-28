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

        // The active section is determined by what is most visible or topmost in view.
        // If bottom of page is reached, or last visible section is present, prefer highest ratio
        // or last section when both sticky panel and overlaying card are intersecting.
        let winner: SectionId | null = null;
        if (visible.has("contact")) {
          winner = "contact";
        } else {
          winner = ids.find((id) => visible.has(id)) ?? null;
        }
        setActive(winner);
      },
      { rootMargin: "-20% 0px -40% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

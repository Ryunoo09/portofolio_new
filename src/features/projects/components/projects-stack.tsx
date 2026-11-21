"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { loadGsap } from "@/features/motion/lib/load-gsap";

type ProjectsStackProps = { children: ReactNode };

export function ProjectsStack({ children }: ProjectsStackProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void loadGsap().then(({ gsap, ScrollTrigger }) => {
      const root = rootRef.current;
      if (cancelled || !root) return;

      const cards = [...root.querySelectorAll<HTMLElement>(".project-card")];
      const media = gsap.matchMedia();
      media.add("(min-width: 64rem)", () => {
        const context = gsap.context(() => {
          cards.slice(0, -1).forEach((card, index) => {
            gsap.to(card, {
              scale: 0.92,
              y: -24,
              opacity: 0.55,
              ease: "none",
              scrollTrigger: {
                trigger: cards[index + 1],
                start: "top 72%",
                end: "top 28%",
                scrub: true,
              },
            });
          });
        }, root);

        return () => context.revert();
      });

      cleanup = () => media.revert();
      ScrollTrigger.refresh();
    }).catch(() => {});

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return <div ref={rootRef}>{children}</div>;
}

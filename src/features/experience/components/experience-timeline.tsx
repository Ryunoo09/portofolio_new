"use client";

import { useEffect, useRef, useState } from "react";
import { Section } from "@/components/ui";
import { loadGsap } from "@/features/motion/lib/load-gsap";
import type { Experience } from "@/types/content";
import { ExperienceCard } from "./experience-card";

type ExperienceTimelineProps = {
  experiences: Experience[];
};

export function ExperienceTimeline({ experiences }: ExperienceTimelineProps) {
  const containerRef = useRef<HTMLOListElement>(null);
  // Default first card is expanded for immediate visibility
  const [activeId, setActiveId] = useState<string | null>(
    experiences[0]?.id ?? null,
  );

  useEffect(() => {
    if (experiences.length === 0) return;

    // Do not spin up GSAP in test runner / jsdom environments or under reduced motion
    const isTestEnvironment =
      typeof window !== "undefined" &&
      window.navigator.userAgent.includes("jsdom");

    if (
      isTestEnvironment ||
      typeof window === "undefined" ||
      (typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    ) {
      return;
    }

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void loadGsap().then(({ ScrollTrigger }) => {
      if (cancelled || !containerRef.current) return;

      const cardElements = containerRef.current.querySelectorAll<HTMLElement>("[data-exp-card]");
      if (cardElements.length === 0) return;

      const triggers: InstanceType<typeof ScrollTrigger>[] = [];

      cardElements.forEach((el, index) => {
        const item = experiences[index];
        if (!item) return;

        const st = ScrollTrigger.create({
          trigger: el,
          start: "top 65%",
          end: "bottom 35%",
          onEnter: () => setActiveId(item.id),
          onEnterBack: () => setActiveId(item.id),
        });
        triggers.push(st);
      });

      cleanup = () => {
        triggers.forEach((t) => t.kill());
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [experiences]);

  const handleToggle = (id: string) => {
    setActiveId((current) => (current === id ? null : id));
  };

  return (
    <Section id="experience" eyebrow="Experience" title="Experience" layout="split">
      {experiences.length === 0 ? (
        <p className="text-fg-muted text-sm">Experience is being updated.</p>
      ) : (
        <ol ref={containerRef} className="exp-accordion">
          {experiences.map((item, index) => (
            <li key={item.id}>
              <ExperienceCard
                item={item}
                index={index}
                isOpen={activeId === item.id}
                onToggle={() => handleToggle(item.id)}
              />
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}

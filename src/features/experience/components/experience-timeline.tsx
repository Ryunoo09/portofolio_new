"use client";

import { useEffect, useRef, useState } from "react";
import { Section } from "@/components/ui";
import { RevealRows } from "@/features/motion";
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
  // Once the visitor opens or closes a card themselves, scrolling must not
  // reopen it behind their back.
  const userToggled = useRef(false);

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

        // Scrolling opens the card in view until the visitor takes over; after
        // that the accordion keeps whatever they chose.
        const openOnScroll = () => {
          if (!userToggled.current) setActiveId(item.id);
        };

        const st = ScrollTrigger.create({
          trigger: el,
          start: "top 65%",
          end: "bottom 35%",
          onEnter: openOnScroll,
          onEnterBack: openOnScroll,
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
    userToggled.current = true;
    setActiveId((current) => (current === id ? null : id));
  };

  return (
    <Section id="experience" eyebrow="Experience" title="Experience" layout="split">
      {experiences.length === 0 ? (
        <p className="text-fg-muted text-sm">Experience is being updated.</p>
      ) : (
        <RevealRows selector="li" distance={20} duration={0.6} stagger={0.1}>
          <div className="exp-timeline">
            <span className="exp-progress" aria-hidden="true" />
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
          </div>
        </RevealRows>
      )}
    </Section>
  );
}

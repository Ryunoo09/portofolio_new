"use client";

import { useEffect, useState } from "react";
import type { Skill } from "@/types/content";
import { SkillIcon } from "./skill-icons";

type SkillsMarqueeProps = {
  skills: Skill[];
};

export function SkillsMarquee({ skills }: SkillsMarqueeProps) {
  const [userPaused, setUserPaused] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);

  useEffect(() => {
    const onVisibilityChange = () => setPageHidden(document.hidden);
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const paused = userPaused || pageHidden;
  const label = userPaused ? "Resume skills animation" : "Pause skills animation";

  const half = Math.ceil(skills.length / 2);
  const row1 = skills.slice(0, half);
  const row2 = skills.slice(half);

  return (
    <div
      className="skills-marquee relative py-2"
      data-paused={paused}
    >
      <div aria-hidden="true" className="skills-marquee-window min-w-0 space-y-3.5">
        {/* Row 1: Left */}
        <div className="skills-marquee-track">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 items-center">
              {row1.map((skill) => (
                <li key={`${copy}-${skill.id}`} className="px-1.5">
                  <span className="skill-chip">
                    <SkillIcon name={skill.name} category={skill.category} />
                    <span>{skill.name}</span>
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>

        {/* Row 2: Right (Reverse) */}
        {row2.length > 0 && (
          <div className="skills-marquee-track skills-marquee-track--reverse">
            {[0, 1].map((copy) => (
              <ul key={copy} className="flex shrink-0 items-center">
                {row2.map((skill) => (
                  <li key={`${copy}-${skill.id}`} className="px-1.5">
                    <span className="skill-chip">
                      <SkillIcon name={skill.name} category={skill.category} />
                      <span>{skill.name}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          aria-label={label}
          onClick={() => setUserPaused((value) => !value)}
          className="skills-marquee-toggle border-border bg-surface text-fg-muted hover:text-fg hover:border-border-strong focus-visible:text-fg flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-xs transition-colors"
        >
          <span aria-hidden="true">{paused ? "▶" : "❚❚"}</span>
          <span>{paused ? "Resume animation" : "Pause animation"}</span>
        </button>
      </div>
    </div>
  );
}

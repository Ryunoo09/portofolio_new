"use client";

import { useEffect, useState } from "react";

/**
 * The strip repeats names that are already readable in the category lists, so it
 * is decoration: `aria-hidden` from the parent, one copy of text in the page.
 *
 * It still moves on its own, so WCAG 2.2.2 needs a way to stop it. Hover and
 * focus pause the animation in CSS; this button gives keyboard and touch users
 * the same control, and the tab going to the background pauses it too.
 */
type SkillsMarqueeProps = {
  names: string[];
};

export function SkillsMarquee({ names }: SkillsMarqueeProps) {
  const [userPaused, setUserPaused] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);

  useEffect(() => {
    const onVisibilityChange = () => setPageHidden(document.hidden);

    // A tab can start hidden; run once so it never animates unseen.
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const paused = userPaused || pageHidden;
  // Only a user action changes the label: auto-pausing in a hidden tab must not
  // tell a screen reader the strip is something the visitor paused.
  const label = userPaused ? "Resume skills animation" : "Pause skills animation";

  return (
    <div
      className="skills-marquee border-border mt-14 flex items-center border-y py-3"
      data-paused={paused}
    >
      <div aria-hidden="true" className="skills-marquee-window min-w-0 flex-1">
        <div className="skills-marquee-track">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 items-center">
              {names.map((name, index) => (
                <li
                  key={`${copy}-${index}`}
                  className="text-fg-muted flex items-center font-mono text-xs tracking-[0.2em] whitespace-nowrap uppercase"
                >
                  {name}
                  <span className="text-accent mx-6">/</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label={label}
        onClick={() => setUserPaused((value) => !value)}
        className="skills-marquee-toggle border-border-strong text-fg-muted hover:text-fg focus-visible:text-fg ml-4 min-h-6 min-w-6 shrink-0 rounded-sm border px-2 py-1 font-mono text-[0.625rem]"
      >
        <span aria-hidden="true">{paused ? "▶" : "❚❚"}</span>
      </button>
    </div>
  );
}

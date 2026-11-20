import { readFileSync } from "node:fs";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skills } from "@/features/skills";
import type { Skill } from "@/types/content";

function make(skills: [string, string][]): Skill[] {
  return skills.map(([name, category], index) => ({
    id: `s${index}`,
    name,
    category,
    icon: null,
    sort_order: index + 1,
  }));
}

const seeded = make([
  ["TypeScript", "Frontend"],
  ["React", "Frontend"],
  ["Node.js", "Backend"],
  ["PostgreSQL", "Database"],
  ["Docker", "Tools"],
]);

describe("Skills", () => {
  it("renders the Tech Stack heading and description", () => {
    render(<Skills skills={seeded} />);

    expect(screen.getByRole("heading", { level: 2, name: "Tech Stack" })).toBeInTheDocument();
    expect(screen.getByText(/Tools and technologies I use/i)).toBeInTheDocument();
  });

  it("exposes every name once to assistive tech and repeats it only as decoration", () => {
    render(<Skills skills={seeded} />);

    // `listitem` has no accessible name from content, so read the visible items
    // themselves: the aria-hidden marquee must not add a second copy.
    const exposed = screen.getAllByRole("listitem").map((item) => item.textContent);

    expect(exposed).toHaveLength(seeded.length);
    for (const skill of seeded) {
      expect(exposed.filter((text) => text === skill.name)).toHaveLength(1);
    }

    const marquee = document.querySelector(".skills-marquee-window");

    expect(marquee).toHaveAttribute("aria-hidden", "true");
    expect(marquee?.textContent).toContain("TypeScript");
  });

  it("stops the marquee from a keyboard-reachable control", () => {
    render(<Skills skills={seeded} />);

    const marquee = document.querySelector(".skills-marquee");
    const toggle = screen.getByRole("button", { name: "Pause skills animation" });

    expect(marquee).toHaveAttribute("data-paused", "false");

    fireEvent.click(toggle);

    expect(marquee).toHaveAttribute("data-paused", "true");
    expect(screen.getByRole("button", { name: "Resume skills animation" })).toBeVisible();
  });

  it("says skills are coming instead of rendering an empty section", () => {
    render(<Skills skills={[]} />);

    expect(screen.getByText("Skills are being added.")).toBeVisible();
    expect(document.querySelector(".skills-marquee")).toBeNull();
  });

  it("only animates transform, and only when the user allows motion", () => {
    const css = readFileSync("src/styles/skills.css", "utf8");
    const keyframes = /@keyframes skills-marquee \{([\s\S]*?)\}/.exec(css)?.[1] ?? "";

    expect(keyframes).toContain("transform: translateX(-50%)");
    expect(keyframes).not.toMatch(/\b(width|height|top|left|right|bottom|margin|padding):/);

    // Motion is opt-in: the animation is declared inside `no-preference`, so a
    // reduced-motion user never receives an animation to cancel.
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: no-preference\) \{[^@]*animation: skills-marquee/,
    );
    expect(css.split("animation: skills-marquee")).toHaveLength(2);
  });
});

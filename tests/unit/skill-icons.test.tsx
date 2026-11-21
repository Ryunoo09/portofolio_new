import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SkillIcon } from "@/features/skills/components/skill-icons";
import type { Skill } from "@/types/content";

describe("SkillIcon", () => {
  const jsonPath = resolve(process.cwd(), "content/skills.json");
  const skills: Skill[] = JSON.parse(readFileSync(jsonPath, "utf-8"));

  it("provides an accessible svg icon for every skill in content/skills.json", () => {
    expect(skills.length).toBe(28);

    for (const skill of skills) {
      const { container } = render(
        <SkillIcon name={skill.name} category={skill.category} />,
      );
      const svg = container.querySelector("svg");

      expect(svg).not.toBeNull();
      expect(svg).toHaveAttribute("aria-hidden", "true");
    }
  });
});

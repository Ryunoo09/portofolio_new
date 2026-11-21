import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NAV_SECTIONS } from "@/lib/sections";
import { NavIcon, type NavIconName } from "@/features/navigation/components/nav-icons";

describe("NavIcon", () => {
  it("provides an icon component for every section in NAV_SECTIONS", () => {
    for (const section of NAV_SECTIONS) {
      const { container } = render(<NavIcon name={section.icon as NavIconName} />);
      const svg = container.querySelector("svg");

      expect(svg).not.toBeNull();
      expect(svg).toHaveAttribute("aria-hidden", "true");
    }
  });
});

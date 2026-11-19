import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Section } from "@/components/ui";
import { RevealWords } from "@/features/motion";

/** jsdom has no `matchMedia`; the hook treats that as "motion allowed". */
function stubReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: reduce,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

beforeEach(() => {
  stubReducedMotion(false);
});

describe("RevealWords", () => {
  it("keeps the heading as real text with real spaces", () => {
    const { container } = render(<RevealWords text="Who I am" />);

    expect(container.textContent).toBe("Who I am");
    expect(container.querySelectorAll("[data-word]")).toHaveLength(3);
  });

  it("leaves every word visible until GSAP takes over", () => {
    const { container } = render(<RevealWords text="Selected work" />);

    for (const word of container.querySelectorAll<HTMLElement>("[data-word]")) {
      expect(word.style.opacity).toBe("");
      expect(word.style.transform).toBe("");
    }
  });

  it("still names a section by the full heading", () => {
    const { container } = render(
      <Section id="about" title="Who I am">
        <p>Body</p>
      </Section>,
    );

    expect(screen.getByRole("heading", { level: 2, name: "Who I am" })).toBeInTheDocument();
    expect(container.querySelectorAll("#about-title [data-word]")).toHaveLength(3);
  });
});

describe("scroll-linked decoration CSS", () => {
  const css = readFileSync("src/styles/motion.css", "utf8");

  it("only runs where motion is allowed and scroll timelines exist", () => {
    expect(css).toContain(
      "@supports ((animation-timeline: view()) and (animation-range: entry))",
    );
    expect(css).toContain("@media (prefers-reduced-motion: no-preference)");
  });

  it("moves nothing but transform and opacity", () => {
    for (const name of ["section-shine", "hero-drift"]) {
      const body = new RegExp(`@keyframes ${name} \\{([\\s\\S]*?)\\n\\}`).exec(css)?.[1] ?? "";

      expect(body).not.toBe("");
      expect(body).not.toMatch(/\b(width|height|top|left|right|bottom|margin|padding|inset):/);
    }
  });
});
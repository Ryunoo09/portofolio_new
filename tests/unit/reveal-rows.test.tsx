import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RevealRows } from "@/features/motion";

/** jsdom has no `matchMedia`; every test needs one. */
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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("RevealRows", () => {
  it("renders its children in the HTML, so nothing depends on the script", () => {
    const { container } = render(
      <RevealRows selector="li">
        <ol>
          <li>First</li>
          <li>Second</li>
        </ol>
      </RevealRows>,
    );

    expect(container.querySelectorAll("li")).toHaveLength(2);
    expect(container.textContent).toBe("FirstSecond");
  });

  it("adds no layout box of its own", () => {
    const { container } = render(
      <RevealRows selector="li">
        <ol>
          <li>First</li>
        </ol>
      </RevealRows>,
    );

    const wrapper = container.firstElementChild as HTMLElement;

    expect(wrapper.style.display).toBe("contents");
  });

  it("never hides a row before GSAP arrives", () => {
    // GSAP is imported lazily; until then every row must be fully visible, so a
    // slow or failed import cannot leave the page blank.
    const { container } = render(
      <RevealRows selector="li">
        <ol>
          <li>First</li>
        </ol>
      </RevealRows>,
    );

    const row = container.querySelector("li") as HTMLElement;

    expect(row.style.opacity).toBe("");
    expect(row.style.transform).toBe("");
  });
});

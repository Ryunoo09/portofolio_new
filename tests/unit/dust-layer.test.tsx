import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DustLayer } from "@/features/motion";

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
  // jsdom has no canvas backend; returning null exercises the guard and keeps
  // the "not implemented" warning out of the test output.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("DustLayer", () => {
  it("is a decorative canvas that never catches a click", () => {
    const { container } = render(<DustLayer />);
    const canvas = container.querySelector("canvas");

    expect(canvas).not.toBeNull();
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).toHaveAttribute("data-dust");
    expect(canvas).toHaveClass("dust-layer");
  });

  it("renders without a 2d context instead of throwing", () => {
    expect(() => render(<DustLayer />)).not.toThrow();
  });
});
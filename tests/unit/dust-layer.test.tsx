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

type FakeContext = {
  setTransform: () => void;
  clearRect: () => void;
  beginPath: () => void;
  arc: () => void;
  fill: () => void;
  shadowBlur: number;
  shadowColor: string;
  globalAlpha: number;
  fillStyle: string;
};

/** Records one paint per `clearRect`, plus the arcs drawn after it. */
function fakeContext() {
  const arcsPerPaint: number[] = [];
  const context: FakeContext = {
    setTransform: () => {},
    clearRect: () => arcsPerPaint.push(0),
    beginPath: () => {},
    arc: () => {
      arcsPerPaint[arcsPerPaint.length - 1] = (arcsPerPaint.at(-1) ?? 0) + 1;
    },
    fill: () => {},
    shadowBlur: 0,
    shadowColor: "",
    globalAlpha: 1,
    fillStyle: "",
  };

  return { context, arcsPerPaint };
}

describe("DustLayer", () => {
  it("stays within the PRD limits: at most 60 dots at 30 fps", () => {
    vi.stubGlobal("innerWidth", 2560);
    vi.stubGlobal("innerHeight", 1440);

    const { context, arcsPerPaint } = fakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );

    const callbacks: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callbacks.push(callback);
      return callbacks.length;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    render(<DustLayer />);

    // Drive 600 ms of frames at a 16 ms display refresh.
    for (let time = 0; time <= 600; time += 16) {
      const callback = callbacks.pop();
      callback?.(time);
    }

    expect(Math.max(...arcsPerPaint)).toBeLessThanOrEqual(60);
    // 30 fps over 600 ms is 18 paints; 60 fps would be 38.
    expect(arcsPerPaint.length).toBeLessThanOrEqual(24);
    expect(arcsPerPaint.length).toBeGreaterThanOrEqual(15);
  });

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
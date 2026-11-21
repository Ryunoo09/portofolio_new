import { act, render, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Preloader, PRELOADER_KEY } from "@/features/preloader";

function mockReducedMotion(reduce: boolean) {
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
  sessionStorage.clear();
  mockReducedMotion(false);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Preloader", () => {
  it("renders nothing on the server, so a no-JS visitor never sees an overlay", () => {
    // Static markup is what a browser without JavaScript receives; the client
    // render then shows the overlay, so this is the state that matters.
    const markup = renderToString(<Preloader />);

    expect(markup).toBe("");
  });

  it("covers the page on the first visit and counts up", async () => {
    const { container } = render(<Preloader />);

    expect(container.querySelector(".preloader")).toHaveAttribute("role", "status");
    expect(container.querySelector(".preloader-wordmark")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector('[role="progressbar"]')).toHaveAttribute("aria-valuenow", "0");
    expect(container.querySelector(".preloader-progress-fill")).not.toBeNull();
    expect(container.querySelector(".preloader-count")?.textContent).toBe("0%");

    await waitFor(() =>
      expect(container.querySelector(".preloader-count")?.textContent).not.toBe("0%"),
    );
  });

  it("removes itself from the DOM inside the PRD window", async () => {
    vi.useFakeTimers();
    const { container } = render(<Preloader />);

    expect(container.querySelector(".preloader")).not.toBeNull();

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(container.querySelector(".preloader")).toBeNull();
    expect(container.textContent).toBe("");
  });

  it("stays up for the whole intro instead of hiding on the first tick", async () => {
    vi.useFakeTimers();
    const { container } = render(<Preloader />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Writing the session flag during the intro made `skip()` true on the next
    // render, so the overlay was removed after ~100 ms and the CSS exit never ran.
    expect(container.querySelector(".preloader")).not.toBeNull();

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(container.querySelector(".preloader")).toBeNull();
  });

  it("decodes the wordmark and exposes an accessible progress bar", async () => {
    const { container } = render(<Preloader />);

    expect(container.querySelector(".preloader-wordmark")?.textContent).toHaveLength(8);
    expect(container.querySelector('[role="progressbar"]')).toHaveAttribute("aria-valuemin", "0");
    expect(container.querySelector('[role="progressbar"]')).toHaveAttribute("aria-valuemax", "100");
    expect(container.querySelector('[role="progressbar"]')).toHaveAttribute("aria-valuenow", "0");
  });

  it("never runs twice in the same session", async () => {
    vi.useFakeTimers();
    const first = render(<Preloader />);

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(sessionStorage.getItem(PRELOADER_KEY)).toBe("1");
    first.unmount();

    const second = render(<Preloader />);

    expect(second.container.querySelector(".preloader")).toBeNull();
  });

  it("is skipped entirely under reduced motion", () => {
    mockReducedMotion(true);
    const { container } = render(<Preloader />);

    expect(container.querySelector(".preloader")).toBeNull();
    // Not marked as seen either, so a preference change can still show it later.
    expect(sessionStorage.getItem(PRELOADER_KEY)).toBeNull();
  });

  it("marks the session only after the overlay has been shown", async () => {
    vi.useFakeTimers();
    render(<Preloader />);

    // Writing the flag up front flipped `skip()` on the next render.
    expect(sessionStorage.getItem(PRELOADER_KEY)).toBeNull();

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(sessionStorage.getItem(PRELOADER_KEY)).toBe("1");
  });
});

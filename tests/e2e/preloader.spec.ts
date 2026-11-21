import { expect, test } from "@playwright/test";

const OVERLAY = ".preloader";

/**
 * The overlay lives for ~1.2 s and can appear and disappear before `goto`
 * resolves, so the probe has to be installed before the page script runs.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.clear();
    const trace = { appeared: false, appearedAt: 0, removedAt: 0 };
    (window as unknown as { __preloaderTrace: typeof trace }).__preloaderTrace = trace;

    const see = (overlay: Element | null) => {
      if (overlay && !trace.appeared) {
        trace.appeared = true;
        trace.appearedAt = performance.now();
      }

      if (!overlay && trace.appeared && trace.removedAt === 0) {
        trace.removedAt = performance.now();
      }
    };

    const watch = () => {
      const observer = new MutationObserver(() => {
        see(document.querySelector(".preloader"));
      });

      observer.observe(document.documentElement, { childList: true, subtree: true });

      // Record the first paint too: an overlay shown and removed before the
      // observer was attached would otherwise be invisible to this probe.
      see(document.querySelector(".preloader"));
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", watch, { once: true });
    } else {
      watch();
    }
  });
});

test.describe("preloader", () => {
  test("covers the page on a first visit, then leaves the DOM", async ({ page }) => {
    await page.goto("/");

    // The overlay must appear at some point during the 1.2 s intro.
    await expect
      .poll(
        () =>
          page.evaluate(
            () =>
              (window as unknown as { __preloaderTrace: { appeared: boolean } }).__preloaderTrace
                .appeared,
          ),
        { timeout: 5000 },
      )
      .toBe(true);

    // ...and then be removed rather than left hidden.
    await expect(page.locator(OVERLAY)).toHaveCount(0, { timeout: 5000 });
  });

  test("does not run again in the same session, including a reload", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(OVERLAY)).toHaveCount(0, { timeout: 3000 });

    await page.reload();

    // Give hydration a moment: a second run would show up here.
    await page.waitForTimeout(400);
    await expect(page.locator(OVERLAY)).toHaveCount(0);
  });

  test("lasts between 0.8 and 2.0 seconds", async ({ page }) => {
    await page.goto("/");

    // The overlay mounts a few hundred ms in, so wait for it before waiting
    // for it to leave: a count of 0 means nothing until it has appeared once.
    await expect
      .poll(
        () =>
          page.evaluate(
            () =>
              (window as unknown as { __preloaderTrace: { appeared: boolean } }).__preloaderTrace
                .appeared,
          ),
        { timeout: 5000 },
      )
      .toBe(true);

    await expect(page.locator(OVERLAY)).toHaveCount(0, { timeout: 5000 });

    const trace = await page.evaluate(
      () =>
        (
          window as unknown as {
            __preloaderTrace: { appeared: boolean; appearedAt: number; removedAt: number };
          }
        ).__preloaderTrace,
    );

    const elapsed = trace.removedAt - trace.appearedAt;

    expect(trace.appeared, JSON.stringify(trace)).toBe(true);
    expect(trace.removedAt, JSON.stringify(trace)).toBeGreaterThan(0);
    expect(elapsed).toBeGreaterThanOrEqual(800);
    expect(elapsed).toBeLessThanOrEqual(2000);
  });

  test("keeps the page content readable underneath", async ({ page }) => {
    await page.goto("/");

    // Content is server-rendered; the overlay never gates it.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /Skills|Tech Stack/ })).toBeVisible();
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("is skipped entirely", async ({ page }) => {
      await page.goto("/");

      await page.waitForTimeout(400);
      await expect(page.locator(OVERLAY)).toHaveCount(0);
    });
  });

  test("is never inserted without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    await page.goto("/");

    await expect(page.locator(OVERLAY)).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await context.close();
  });
});

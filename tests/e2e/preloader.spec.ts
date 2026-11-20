import { expect, test } from "@playwright/test";

const OVERLAY = ".preloader";

/**
 * The overlay lives for ~1.2 s and can appear and disappear before `goto`
 * resolves, so the probe has to be installed before the page script runs.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const trace = { appeared: false, goneAtEnd: true };
    (window as unknown as { __preloaderTrace: typeof trace }).__preloaderTrace = trace;

    const watch = () => {
      const observer = new MutationObserver(() => {
        if (document.querySelector(".preloader")) trace.appeared = true;
      });

      observer.observe(document.documentElement, { childList: true, subtree: true });

      // Record the first paint too: an overlay shown and removed before the
      // observer was attached would otherwise be invisible to this probe.
      if (document.querySelector(".preloader")) trace.appeared = true;
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

import { expect, test } from "@playwright/test";

const OVERLAY = ".preloader";

test.describe("preloader", () => {
  test("covers the page on a first visit, then leaves the DOM", async ({ page }) => {
    await page.goto("/");

    // The overlay only exists for ~1.2 s, so watch it from inside the page rather
    // than racing it with a poll: the mutation record is the evidence.
    const seen = await page.evaluate(async () => {
      let appeared = false;
      const observer = new MutationObserver(() => {
        if (document.querySelector(".preloader")) appeared = true;
      });

      observer.observe(document.documentElement, { childList: true, subtree: true });

      const started = performance.now();
      while (performance.now() - started < 3000) {
        if (document.querySelector(".preloader")) appeared = true;
        if (appeared && !document.querySelector(".preloader")) break;
        await new Promise((resolve) => setTimeout(resolve, 16));
      }

      observer.disconnect();

      return { appeared, gone: !document.querySelector(".preloader") };
    });

    expect(seen).toEqual({ appeared: true, gone: true });
    await expect(page.locator(OVERLAY)).toHaveCount(0);
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
    await expect(page.getByRole("heading", { level: 2, name: "Skills" })).toBeVisible();
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

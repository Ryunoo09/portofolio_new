import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Accessibility and layout gate (US-11): axe finds no serious or critical
 * violation on any page, nothing scrolls sideways at the four breakpoints the
 * PRD names, and the skip link still works with the keyboard alone.
 */

const PAGES = ["/", "/projects/sirata", "/this-page-does-not-exist"];

for (const path of PAGES) {
  test(`axe reports no serious or critical issue on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const blocking = violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .map((violation) => `${violation.id}: ${violation.help} (${violation.nodes.length} nodes)`);

    expect(blocking).toEqual([]);
  });
}

for (const width of [360, 768, 1024, 1440]) {
  test(`nothing scrolls sideways at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });

    for (const path of ["/", "/projects/sirata"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );

      // One pixel of rounding is tolerated; a real horizontal scrollbar is not.
      expect(overflow, `${path} overflows by ${overflow}px`).toBeLessThanOrEqual(1);
    }
  });
}

test("the skip link is the first tab stop and jumps to the main content", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Tab");

  const skip = page.getByRole("link", { name: "Skip to content" });

  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");

  expect(await page.evaluate(() => window.location.hash)).toBe("#main");
});
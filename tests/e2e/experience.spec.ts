import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("experience accordion", () => {
  test("renders experience cards with accessible accordion controls", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const experience = page.locator("#experience");
    await expect(experience.getByRole("heading", { level: 2, name: "Experience" })).toBeVisible();

    const cards = experience.locator(".exp-card");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    // First card is expanded by default
    const firstButton = cards.first().locator("button.exp-card-header");
    await expect(firstButton).toHaveAttribute("aria-expanded", "true");

    // The button is in the server HTML, but its handler only exists after React
    // hydrates, and a click before then does nothing. Poll a click until the
    // handler answers, so the toggle below is not racing hydration.
    await expect
      .poll(
        async () => {
          await firstButton.click();
          return firstButton.getAttribute("aria-expanded");
        },
        { timeout: 15_000 },
      )
      .toBe("false");

    // Click again to reopen
    await firstButton.click();
    await expect(firstButton).toHaveAttribute("aria-expanded", "true");
  });

  test("allows expanding other cards via keyboard", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const cards = page.locator("#experience .exp-card");
    if ((await cards.count()) > 1) {
      const secondButton = cards.nth(1).locator("button.exp-card-header");
      await secondButton.focus();
      await page.keyboard.press("Enter");
      await expect(secondButton).toHaveAttribute("aria-expanded", "true");
    }
  });

  test("passes accessibility checks on experience section", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const { violations } = await new AxeBuilder({ page })
      .include("#experience")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const blocking = violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => `${v.id}: ${v.help}`);

    expect(blocking).toEqual([]);
  });
});

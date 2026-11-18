import { expect, test } from "@playwright/test";

test.describe("about and experience content", () => {
  test("renders the bio and the experience timeline server-side", async ({ page }) => {
    await page.goto("/");

    const about = page.locator("#about");
    const experience = page.locator("#experience");

    await expect(about.getByRole("heading", { level: 2, name: "About" })).toBeVisible();
    await expect(about.getByText("I work on web systems end to end", { exact: false })).toBeVisible();

    await expect(experience.getByRole("heading", { level: 2, name: "Experience" })).toBeVisible();

    const roles = experience.locator("ol > li");
    await expect(roles).toHaveCount(2);

    // First entry is the current role, so it ends with "Present".
    await expect(roles.first()).toContainText("Software Engineer");
    await expect(roles.first()).toContainText("Present");
  });

  test("exposes machine-readable dates on experience entries", async ({ page }) => {
    await page.goto("/");

    const times = page.locator("#experience time");

    await expect(times).not.toHaveCount(0);

    for (const value of await times.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("datetime")),
    )) {
      expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  test("lists roles newest first", async ({ page }) => {
    await page.goto("/");

    // Start dates only: an ongoing role has no end <time>, so position-based
    // selection would compare a start date against an end date.
    const starts = await page
      .locator('#experience ol > li time[data-testid="start"]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("datetime") ?? ""));

    // Guards against passing vacuously when the selector matches nothing.
    const entryCount = await page.locator("#experience ol > li").count();
    expect(starts).toHaveLength(entryCount);
    expect(starts.length).toBeGreaterThan(1);

    expect(starts).toEqual([...starts].sort((a, b) => b.localeCompare(a)));
  });

  test("headings stay in order across the page", async ({ page }) => {
    await page.goto("/");

    const levels = await page
      .locator("main h1, main h2, main h3")
      .evaluateAll((nodes) => nodes.map((node) => Number(node.tagName.slice(1))));

    // A heading may drop by one level at a time but must never skip ahead.
    for (let i = 1; i < levels.length; i += 1) {
      expect(levels[i]! - levels[i - 1]!).toBeLessThanOrEqual(1);
    }
  });
});

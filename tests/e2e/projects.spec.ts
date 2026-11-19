import { expect, test } from "@playwright/test";

test.describe("projects list", () => {
  test("lists published projects with a link to each detail page", async ({ page }) => {
    await page.goto("/");

    const projects = page.locator("#projects");

    await expect(projects.getByRole("heading", { level: 2, name: "Projects" })).toBeVisible();

    const links = projects.locator("ol > li a");

    await expect(links).toHaveCount(3);

    for (const href of await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")))) {
      expect(href).toMatch(/^\/projects\/draft-project-(one|two|three)$/);
    }

    // The unpublished fourth seed project must never leak into the list.
    await expect(projects.getByRole("link", { name: "Draft Project Four" })).toHaveCount(0);
  });

  test("marks a project without public links as Private build", async ({ page }) => {
    await page.goto("/");

    const privateRow = page.locator("#projects ol > li").filter({ hasText: "Draft Project Two" });

    await expect(privateRow.getByText("Private build")).toBeVisible();
    await expect(
      page.locator("#projects ol > li").filter({ hasText: "Draft Project One" }).getByText("Private build"),
    ).toHaveCount(0);
  });

  // Enabled in Step 29, when real cover images exist in content/projects.json.
  test.fixme("reveals the cover preview on hover", async ({ page }) => {
    await page.goto("/");

    const row = page.locator("#projects ol > li").first();
    const preview = row.locator(".project-preview");
    const image = preview.locator("img");

    await expect(preview).toHaveCSS("opacity", "0");

    await row.hover();

    // The reveal is CSS-only with no transition, so it is immediate. Read the
    // computed value instead of polling: polling would hide a slow reveal.
    expect(await preview.evaluate((node) => getComputedStyle(node).opacity)).toBe("1");

    // Pixels, not just the box: a broken cover must fail this test.
    await expect
      .poll(() =>
        image.evaluate((node) => {
          const img = node as HTMLImageElement;
          return img.complete && img.naturalWidth > 0;
        }),
      )
      .toBe(true);
  });
});

test.describe("projects on a touch device", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  // The preview itself only exists once cover images land (Step 29); the tap
  // contract does not depend on that, so it is tested now.
  test("opens the detail page on tap", async ({ page }) => {
    await page.goto("/");

    const row = page.locator("#projects ol > li").first();

    await row.getByRole("link").click();

    await expect(page).toHaveURL(/\/projects\/draft-project-one$/);
  });
});

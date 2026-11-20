import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const published = JSON.parse(readFileSync("content/projects.json", "utf8")) as {
  repo_url: string | null;
  live_url: string | null;
}[];
// The homepage index shows at most nine featured projects (PRD US-04), in
// sort_order, which is the order in the file.
const listed = published.slice(0, 9);
const privateCount = listed.filter((p) => !p.repo_url && !p.live_url).length;

test.describe("projects list", () => {
  test("lists published projects with a link to each detail page", async ({ page }) => {
    await page.goto("/");

    const projects = page.locator("#projects");

    await expect(projects.getByRole("heading", { level: 2, name: "Projects" })).toBeVisible();

    const links = projects.locator("ol > li a[aria-labelledby]");

    await expect(links).toHaveCount(listed.length);

    for (const href of await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")))) {
      expect(href).toMatch(/^\/projects\/[a-z0-9-]+$/);
    }
  });

  test("marks a project without public links as Private build", async ({ page }) => {
    await page.goto("/");

    const rows = page.locator("#projects ol > li");

    await expect(rows).toHaveCount(listed.length);

    // A project with a repo or live site must not carry the label; the rest must.
    await expect(page.locator("#projects").getByText("Private build")).toHaveCount(privateCount);
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

    await row.locator("a[aria-labelledby]").click();

    await expect(page).toHaveURL(/\/projects\/validasi-ftth-yolo26-paddleocr$/);
  });
});

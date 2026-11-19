import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const projects = JSON.parse(readFileSync("content/projects.json", "utf8")) as {
  slug: string;
  title: string;
  summary: string;
  repo_url: string | null;
  live_url: string | null;
  is_published: boolean;
}[];

const published = projects.filter((project) => project.is_published);
const draft = projects.find((project) => !project.is_published);

test.describe("project detail pages", () => {
  for (const project of published) {
    test(`serves ${project.slug} with its case study`, async ({ page }) => {
      const response = await page.goto(`/projects/${project.slug}`);

      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1, name: project.title })).toBeVisible();
      await expect(page.getByRole("link", { name: "← All projects" })).toHaveAttribute(
        "href",
        "/#projects",
      );
      await expect(page.getByRole("heading", { level: 2, name: "Problem" })).toBeVisible();

      const labelCount = await page.getByText("Private build").count();

      expect(labelCount).toBe(project.repo_url || project.live_url ? 0 : 1);
    });
  }

  test("returns 404 for a slug that does not exist", async ({ page }) => {
    const response = await page.goto("/projects/not-a-real-project");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("does not exist");
  });

  test("returns 404 for a project that is not published", async ({ page }) => {
    test.skip(!draft, "no unpublished seed project to test against");

    const response = await page.goto(`/projects/${draft!.slug}`);

    expect(response?.status()).toBe(404);
  });

  test("gives each project its own title, description, and canonical", async ({ page }) => {
    const seen = new Set<string>();

    for (const project of published) {
      await page.goto(`/projects/${project.slug}`);

      const title = await page.title();
      const description = await page
        .locator('meta[name="description"]')
        .getAttribute("content");
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");

      expect(title.length).toBeLessThanOrEqual(60);
      expect(description?.length).toBeGreaterThanOrEqual(140);
      expect(description?.length).toBeLessThanOrEqual(160);
      expect(canonical).toContain(`/projects/${project.slug}`);

      seen.add(`${title}|${description}|${canonical}`);
    }

    expect(seen.size).toBe(published.length);
  });
});

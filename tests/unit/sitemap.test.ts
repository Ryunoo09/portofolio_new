import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { fallbackProjects } from "@/data/fallback";
import { SITE_URL } from "@/lib/seo";

describe("sitemap", () => {
  it("lists the homepage first", async () => {
    const entries = await sitemap();

    expect(entries[0].url).toBe(new URL("/", SITE_URL).toString());
  });

  it("lists every published project and no drafts", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);
    const published = fallbackProjects.filter((project) => project.is_published);
    const drafts = fallbackProjects.filter((project) => !project.is_published);

    for (const project of published) {
      expect(urls).toContain(new URL(`/projects/${project.slug}`, SITE_URL).toString());
    }

    for (const project of drafts) {
      expect(urls).not.toContain(new URL(`/projects/${project.slug}`, SITE_URL).toString());
    }
  });

  it("never lists the same URL twice", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);

    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("robots", () => {
  it("allows crawling and points at the sitemap", () => {
    const rules = robots();

    expect(rules.rules).toEqual({ userAgent: "*", allow: "/" });
    expect(rules.sitemap).toBe(new URL("/sitemap.xml", SITE_URL).toString());
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { projectDescription, projectMetadata, projectTitle } from "@/features/projects";
import type { Project } from "@/types/content";

// Vitest runs from the repository root, so the seed is a plain relative read.
const projects: Project[] = JSON.parse(readFileSync("content/projects.json", "utf8"));

const published = projects.filter((project) => project.is_published);

describe("project metadata", () => {
  it("has published seed projects to check", () => {
    expect(published.length).toBeGreaterThan(0);
  });

  it("keeps every title within 60 characters and specific to its project", () => {
    for (const project of published) {
      const title = projectTitle(project);

      expect(title.length).toBeLessThanOrEqual(60);
      expect(title.startsWith(project.title)).toBe(true);
    }
  });

  it("keeps every description within 140-160 characters", () => {
    for (const project of published) {
      const description = projectDescription(project);

      expect(description.length).toBeGreaterThanOrEqual(140);
      expect(description.length).toBeLessThanOrEqual(160);
    }
  });

  it("gives each project a unique title and description", () => {
    const titles = published.map(projectTitle);
    const descriptions = published.map(projectDescription);

    expect(new Set(titles).size).toBe(published.length);
    expect(new Set(descriptions).size).toBe(published.length);
  });

  it("points the canonical, Open Graph URL, and title at the project", () => {
    const project = published[0];
    const metadata = projectMetadata(project);
    const path = `/projects/${project.slug}`;

    expect(metadata.alternates?.canonical).toBe(path);
    expect(metadata.title).toEqual({ absolute: projectTitle(project) });
    expect(metadata.openGraph).toMatchObject({ type: "article", url: path });
  });
});

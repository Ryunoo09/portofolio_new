import { readFileSync } from "node:fs";
import type { FullConfig } from "@playwright/test";

type SeedProject = { slug: string; is_published: boolean };

/**
 * Next 16's dev server compiles a dynamic route on its first request. With
 * `generateStaticParams` present, two workers requesting the same new slug at the
 * same moment can race inside Turbopack: one gets a 500 from a half-written cache
 * entry ("Unexpected end of JSON input"). A production build prerenders these
 * pages, so this is dev-only.
 *
 * Warming each slug once, sequentially, keeps that first compile out of the
 * parallel run instead of hiding it behind retries.
 */
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL ?? "http://localhost:3000";
  // Vitest/Playwright run from the repository root, next to content/.
  const projects: SeedProject[] = JSON.parse(readFileSync("content/projects.json", "utf8"));

  for (const project of projects.filter((item) => item.is_published)) {
    const response = await fetch(`${baseURL}/projects/${project.slug}`, {
      // globalSetup is not covered by a test timeout, so bound the request.
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
      throw new Error(`Route warmup failed for ${project.slug}: ${response.status}`);
    }
  }
}

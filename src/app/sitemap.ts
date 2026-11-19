import type { MetadataRoute } from "next";
import { getProjects } from "@/data";
import { absoluteUrl } from "@/lib/seo";

// Published content changes without a redeploy, so the sitemap follows the same
// 5-minute ISR window as the pages it lists.
export const revalidate = 300;

/**
 * Homepage plus every published project (PRD 4.6). Drafts are already filtered
 * by the data layer, so an unpublished project is never advertised here.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const now = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: now,
      changeFrequency: "yearly" as const,
      // Below the homepage: these pages support the index, they do not replace it.
      priority: 0.7,
    })),
  ];
}

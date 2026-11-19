import type { Metadata } from "next";
import { truncate } from "@/lib/format";
import { SITE_NAME } from "@/lib/seo";
import type { Project } from "@/types/content";

/**
 * PRD US-04 caps the metadata title at 60 characters and the description at
 * 140-160. The brand suffix goes last so a long project name is never what gets
 * cut. Titles are `absolute` because the layout template would append the site
 * name again, blowing past the cap.
 */
const MAX_TITLE = 60;
const MAX_DESCRIPTION = 160;

export function projectTitle(project: Project): string {
  return truncate(`${project.title} · ${SITE_NAME}`, MAX_TITLE);
}

/**
 * Seed summaries are short (under 140), so role, year, and stack complete the
 * description instead of padding it with filler. Content should still land in
 * range on its own; `truncate` only enforces the ceiling.
 */
export function projectDescription(project: Project): string {
  const parts = [project.summary.trim()];

  if (project.role) parts.push(`${project.role} work.`);
  if (project.year) parts.push(`${project.year}.`);
  if (project.tech?.length) parts.push(`Built with ${project.tech.join(", ")}.`);

  return truncate(parts.join(" "), MAX_DESCRIPTION).replace(/[,;:.]…$/, "…");
}

export function projectMetadata(project: Project): Metadata {
  const title = projectTitle(project);
  const description = projectDescription(project);
  const path = `/projects/${project.slug}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      siteName: SITE_NAME,
      locale: "en_US",
      title,
      description,
    },
  };
}

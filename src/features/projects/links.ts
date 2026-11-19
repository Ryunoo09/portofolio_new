import { isHttpUrl } from "@/lib/url";
import type { Project } from "@/types/content";

/**
 * Public links, filtered to usable schemes. Stored content comes from Studio, so
 * a `javascript:` value is dropped instead of becoming an href.
 */
export function publicLinks(project: Project): { repo: string | null; live: string | null } {
  return {
    repo: project.repo_url && isHttpUrl(project.repo_url) ? project.repo_url : null,
    live: project.live_url && isHttpUrl(project.live_url) ? project.live_url : null,
  };
}

/**
 * PRD US-04 labels a project "Private build" when it has **no public link** — not
 * from `is_private`, which a project with a live site can still carry.
 */
export function hasPublicLink(project: Project): boolean {
  const { repo, live } = publicLinks(project);

  return Boolean(repo || live);
}

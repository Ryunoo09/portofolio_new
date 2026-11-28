import Image from "next/image";
import Link from "next/link";
import { Badge, Button, Heading } from "@/components/ui";
import { renderMarkdown } from "@/lib/markdown";
import { mediaUrl } from "@/lib/media";
import type { ProjectWithMedia } from "@/types/content";
import { hasPublicLink, publicLinks } from "../links";

type ProjectDetailProps = {
  project: ProjectWithMedia;
};

/**
 * Case study for US-04: problem, role, stack, result, links, and the images that
 * back them up. `description_md` is rendered as React elements, never as HTML.
 *
 * Images come from `cover_path` plus `project_media`. Until Step 29 supplies
 * them the gallery is simply absent rather than a placeholder box.
 */
export function ProjectDetail({ project }: ProjectDetailProps) {
  const cover = project.cover_path
    ? { path: project.cover_path, alt: `${project.title} cover image` }
    : null;
  const meta = [project.year ? String(project.year) : null, project.role]
    .filter((part): part is string => Boolean(part))
    .join(" · ");

  const tech = project.tech ?? [];
  const { repo: repoUrl, live: liveUrl } = publicLinks(project);
  const description = project.description_md?.trim();

  return (
    <article className="mx-auto w-full max-w-[var(--container-max)] px-6 pt-14 pb-24">
      <Link
        href="/#projects"
        className="text-fg-muted hover:text-fg font-mono text-xs tracking-[0.2em] uppercase"
      >
        ← All projects
      </Link>

      <header className="mt-8 max-w-[65ch]">
        {meta && (
          <p className="text-fg-muted font-mono text-xs tracking-[0.2em] uppercase">{meta}</p>
        )}
        <Heading level="h1" className="mt-3">
          {project.title}
        </Heading>
        <p className="text-fg-muted mt-4 text-base leading-relaxed">{project.summary}</p>
        {!hasPublicLink(project) && (
          <p className="text-fg-muted border-border-strong mt-4 inline-block rounded-sm border px-2 py-0.5 font-mono text-xs">
            Private build
          </p>
        )}
      </header>

      {cover && (
        <div className="border-border bg-surface relative mt-10 aspect-[16/9] overflow-hidden rounded-sm border">
          <Image
            src={mediaUrl(cover.path)}
            alt={cover.alt}
            fill
            sizes="(min-width: 72rem) 72rem, 100vw"
            className="object-cover"
            // The cover is the LCP element on this page.
            loading="eager"
            fetchPriority="high"
          />
        </div>
      )}

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,65ch)_minmax(0,1fr)] lg:gap-16 items-start">
        {description && (
          <div className="space-y-6">
            {renderMarkdown(description)}
          </div>
        )}

        <aside className="space-y-6 lg:sticky lg:top-24">
          {tech.length > 0 && (
            <div className="rounded-xl border border-border/80 bg-surface/40 p-6 backdrop-blur-xs">
              <h2 className="text-fg font-mono text-xs tracking-[0.2em] uppercase font-semibold">
                Stack
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {tech.map((item, index) => (
                  <li key={`${project.id}-stack-${index}`}>
                    <Badge variant="secondary">{item}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(repoUrl || liveUrl) && (
            <div className="rounded-xl border border-border/80 bg-surface/40 p-6 backdrop-blur-xs">
              <h2 className="text-fg font-mono text-xs tracking-[0.2em] uppercase font-semibold">
                Links
              </h2>
              <div className="mt-4 flex flex-col gap-2.5">
                {liveUrl && (
                  <Button asChild variant="default" className="w-full justify-center">
                    <a href={liveUrl} target="_blank" rel="noreferrer noopener">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-4"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      Live site
                    </a>
                  </Button>
                )}
                {repoUrl && (
                  <Button asChild variant="secondary" className="w-full justify-center">
                    <a href={repoUrl} target="_blank" rel="noreferrer noopener">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-4"
                      >
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                      </svg>
                      Repository
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>

      {project.media.length > 0 && (
        <div className="mt-12 space-y-6">
          {project.media.map((item) => (
            <div
              key={item.id}
              className="border-border bg-surface relative aspect-[16/9] overflow-hidden rounded-sm border"
            >
              <Image
                src={mediaUrl(item.path)}
                // Schema allows an empty alt; a screenshot is meaningful content,
                // so it must not fall back to decorative silence.
                alt={item.alt.trim() || `${project.title} screenshot`}
                fill
                sizes="(min-width: 72rem) 72rem, 100vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

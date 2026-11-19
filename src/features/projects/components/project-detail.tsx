import Image from "next/image";
import Link from "next/link";
import { ButtonLink, Heading, Tag } from "@/components/ui";
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

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,65ch)_minmax(0,1fr)] lg:gap-16">
        {description && (
          <div className="text-fg-muted space-y-4 text-base leading-relaxed">
            {renderMarkdown(description)}
          </div>
        )}

        <aside className="space-y-8">
          {tech.length > 0 && (
            <div>
              <h2 className="text-fg font-mono text-xs tracking-[0.2em] uppercase">Stack</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {tech.map((item, index) => (
                  <Tag key={`${project.id}-stack-${index}`}>{item}</Tag>
                ))}
              </ul>
            </div>
          )}

          {(repoUrl || liveUrl) && (
            <div>
              <h2 className="text-fg font-mono text-xs tracking-[0.2em] uppercase">Links</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {repoUrl && (
                  <ButtonLink href={repoUrl} external variant="secondary">
                    Repository
                  </ButtonLink>
                )}
                {liveUrl && (
                  <ButtonLink href={liveUrl} external>
                    Live site
                  </ButtonLink>
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

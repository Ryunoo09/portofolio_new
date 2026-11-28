import Image from "next/image";
import Link from "next/link";
import { Button, Tag } from "@/components/ui";
import { mediaUrl } from "@/lib/media";
import type { Project } from "@/types/content";
import { hasPublicLink, publicLinks } from "../links";

const MAX_TAGS = 5;

type ProjectCardProps = {
  project: Project;
  index: number;
  reversed?: boolean;
};

export function ProjectCard({ project, index, reversed = false }: ProjectCardProps) {
  const formattedIndex = String(index + 1).padStart(2, "0");
  const titleId = `project-title-${project.id}`;
  const { repo: repoUrl, live: liveUrl } = publicLinks(project);

  return (
    <article className="project-card group">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Mockup Frame (Alternating column on desktop) */}
        <div className={`project-mockup-frame ${reversed ? "lg:order-2" : "lg:order-1"}`}>
          {project.cover_path ? (
            <div aria-hidden="true" className="project-preview">
              <Image
                src={mediaUrl(project.cover_path)}
                alt=""
                fill
                sizes="(min-width: 1024px) 45vw, 90vw"
                loading="lazy"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="project-placeholder-frame" aria-hidden="true">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-accent tracking-widest uppercase">
                  {project.role ?? "Project"}
                </span>
                {project.year && (
                  <span className="font-mono text-xs text-fg-muted">
                    {project.year}
                  </span>
                )}
              </div>
              <div>
                <p className="font-display text-xl text-fg-muted/80 line-clamp-1">
                  {project.title}
                </p>
                <p className="text-xs text-fg-muted/50 font-mono mt-1">
                  Preview snapshot
                </p>
              </div>
              <span className="project-placeholder-watermark">
                {formattedIndex}
              </span>
            </div>
          )}
        </div>

        {/* Content Column */}
        <div className={`flex flex-col gap-3 min-w-0 ${reversed ? "lg:order-1" : "lg:order-2"}`}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span
              aria-hidden="true"
              className="project-index font-mono text-xs font-semibold text-accent"
            >
              {formattedIndex}
            </span>
            {project.year && (
              <span className="font-mono text-xs text-fg-muted">
                {project.year}
              </span>
            )}
            {!hasPublicLink(project) && (
              <span className="border-border-strong text-fg-muted rounded-sm border px-2 py-0.5 font-mono text-xs">
                Private build
              </span>
            )}
          </div>

          <Link
            href={`/projects/${project.slug}`}
            aria-labelledby={titleId}
            className="group/link block"
          >
            <h3
              id={titleId}
              className="font-display text-2xl sm:text-3xl lg:text-4xl tracking-tight text-fg group-hover/link:text-accent transition-colors"
            >
              {project.title}
            </h3>
          </Link>

          {project.role && (
            <p className="text-xs font-mono text-accent-soft/90 tracking-wide uppercase">
              {project.role}
            </p>
          )}

          <p className="text-fg-muted text-sm sm:text-base leading-relaxed line-clamp-3">
            {project.summary}
          </p>

          {project.tech?.length > 0 && (
            <ul
              aria-label={`Technologies for ${project.title}`}
              className="mt-2 flex flex-wrap gap-2"
            >
              {project.tech.slice(0, MAX_TAGS).map((tech, techIndex) => (
                <Tag key={`${project.id}-tech-${techIndex}`}>{tech}</Tag>
              ))}
            </ul>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <Button asChild size="sm" variant="default">
              <Link href={`/projects/${project.slug}`}>
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
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                Case study
              </Link>
            </Button>

            {repoUrl && (
              <Button asChild size="sm" variant="secondary">
                <a href={repoUrl} target="_blank" rel="noopener noreferrer">
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
                  Code
                </a>
              </Button>
            )}

            {liveUrl && (
              <Button asChild size="sm" variant="outline">
                <a href={liveUrl} target="_blank" rel="noopener noreferrer">
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
                  Live
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

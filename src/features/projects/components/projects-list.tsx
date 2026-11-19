import Image from "next/image";
import Link from "next/link";
import { Section, Tag } from "@/components/ui";
import { mediaUrl } from "@/lib/media";
import type { Project } from "@/types/content";

/** PRD US-04: at most five technology tags per row. */
const MAX_TAGS = 5;

/** PRD US-04: at most eight featured projects. */
const MAX_PROJECTS = 8;

type ProjectsListProps = {
  projects: Project[];
};

/**
 * Numbered project index (US-04). The number is a real sequence position, not
 * decoration: it states the order a hiring manager is reading.
 *
 * The whole row is one link, so a touch tap navigates straight to the detail page.
 * A hover preview of the cover sits in a reserved column on large screens, so
 * showing it never shifts the layout (CLS 0) and it cannot swallow a tap.
 */
export function ProjectsList({ projects }: ProjectsListProps) {
  return (
    <Section id="projects" eyebrow="Projects" title="Projects">
      {projects.length === 0 ? (
        <p className="text-fg-muted text-sm">Projects are being added.</p>
      ) : (
        <ol className="border-border border-t">
          {projects.slice(0, MAX_PROJECTS).map((project, index) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.slug}`}
                aria-labelledby={`project-title-${project.id}`}
                className="project-row border-border grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-4 border-b py-7 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:gap-x-6 lg:grid-cols-[2.75rem_minmax(0,1fr)_11rem]"
              >
                <span
                  aria-hidden="true"
                  className="project-index text-fg-muted pt-1 font-mono text-xs tabular-nums lg:pt-0"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                    <h3
                      id={`project-title-${project.id}`}
                      className="text-fg font-display text-2xl tracking-tight sm:text-3xl"
                    >
                      {project.title}
                    </h3>
                    {project.is_private && (
                      <span className="border-border-strong text-fg-muted rounded-sm border px-2 py-0.5 font-mono text-xs">
                        Private build
                      </span>
                    )}
                  </div>

                  <p className="text-fg-muted mt-2 max-w-[60ch] text-sm leading-relaxed">
                    {project.summary}
                  </p>

                  {project.tech?.length > 0 && (
                    <ul
                      aria-label={`Technologies for ${project.title}`}
                      className="mt-4 flex flex-wrap gap-2"
                    >
                      {project.tech.slice(0, MAX_TAGS).map((tech, techIndex) => (
                        <Tag key={`${project.id}-tech-${techIndex}`}>{tech}</Tag>
                      ))}
                    </ul>
                  )}
                </div>

                {project.cover_path && (
                  <div
                    aria-hidden="true"
                    className="project-preview border-border relative hidden aspect-[4/3] w-full self-center overflow-hidden rounded-sm border lg:block"
                  >
                    <Image
                      src={mediaUrl(project.cover_path)}
                      alt=""
                      fill
                      sizes="11rem"
                      loading="lazy"
                      className="object-cover"
                    />
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}

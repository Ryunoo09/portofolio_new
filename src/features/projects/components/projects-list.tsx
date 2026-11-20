import { Section } from "@/components/ui";
import { RevealRows } from "@/features/motion";
import type { Project } from "@/types/content";
import { ProjectCard } from "./project-card";

/** PRD US-04: at most nine featured projects. */
const MAX_PROJECTS = 9;

type ProjectsListProps = {
  projects: Project[];
};

/**
 * Featured Projects Showcase (US-04).
 * Alternating large showcase cards with mockup previews and comprehensive detail highlights.
 * Rendered in an ordered list for accessible reading sequence.
 */
export function ProjectsList({ projects }: ProjectsListProps) {
  const visibleProjects = projects.slice(0, MAX_PROJECTS);

  return (
    <Section id="projects" eyebrow="Projects" title="Projects">
      {visibleProjects.length === 0 ? (
        <p className="text-fg-muted text-sm">Projects are being added.</p>
      ) : (
        <RevealRows selector="li" distance={32} duration={0.65} stagger={0.12} blur={8}>
          <ol className="projects-container">
            {visibleProjects.map((project, index) => (
              <li key={project.id}>
                <ProjectCard
                  project={project}
                  index={index}
                  reversed={index % 2 === 1}
                />
              </li>
            ))}
          </ol>
        </RevealRows>
      )}
    </Section>
  );
}

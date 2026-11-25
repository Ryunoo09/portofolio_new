import { Section } from "@/components/ui";
import { RevealRows } from "@/features/motion";
import type { Project } from "@/types/content";
import { ProjectCard } from "./project-card";
import { ProjectsStack } from "./projects-stack";

type ProjectsListProps = {
  projects: Project[];
};

/**
 * Featured Projects Showcase (US-04).
 * Alternating large showcase cards with mockup previews and comprehensive detail highlights.
 * Rendered in an ordered list for accessible reading sequence.
 */
export function ProjectsList({ projects }: ProjectsListProps) {
  return (
    <Section id="projects" eyebrow="Projects" title="Projects">
      {projects.length === 0 ? (
        <p className="text-fg-muted text-sm">Projects are being added.</p>
      ) : (
        <ProjectsStack>
          <RevealRows selector="li" distance={24} duration={0.6} stagger={0.08}>
            <ol className="projects-container">
              {projects.map((project, index) => (
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
        </ProjectsStack>
      )}
    </Section>
  );
}

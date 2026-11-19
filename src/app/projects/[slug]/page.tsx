import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail, projectMetadata } from "@/features/projects";
import { getProject, getProjects } from "@/data";

// Route config must be a literal Next can read statically; the value mirrors
// REVALIDATE_SECONDS in the data layer (ISR: a Supabase edit shows up in 5 min).
export const revalidate = 300;

type ProjectPageProps = {
  // Next 16 hands route params to the page as a Promise.
  params: Promise<{ slug: string }>;
};

/** Prerenders published projects only; drafts never get a build output. */
export async function generateStaticParams() {
  const projects = await getProjects();

  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  return project ? projectMetadata(project) : {};
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);

  // Unknown slug, or a project that is not published: the data layer filters
  // drafts, so both cases land here and render the 404 page.
  if (!project) notFound();

  return <ProjectDetail project={project} />;
}

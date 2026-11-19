import { getProject } from "@/data";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/features/seo/og";
import { truncate } from "@/lib/format";
import { SITE_NAME } from "@/lib/seo";

// Mirrors the page so a published edit changes the card within 5 minutes.
export const revalidate = 300;

export const alt = `Project case study · ${SITE_NAME}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

type OgProps = {
  // Next 16 hands route params to metadata routes as a Promise.
  params: Promise<{ slug: string }>;
};

export default async function ProjectOpengraphImage({ params }: OgProps) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return renderOgImage({
      eyebrow: "Case study",
      title: SITE_NAME,
      footer: "This case study is not published.",
      note: "Portfolio",
    });
  }

  const facts = [project.role, project.year ? String(project.year) : null]
    .filter(Boolean)
    .join(" · ");

  return renderOgImage({
    eyebrow: project.is_private ? "Private build" : "Case study",
    title: project.title,
    footer: truncate(project.summary, 96),
    note: facts || SITE_NAME,
  });
}
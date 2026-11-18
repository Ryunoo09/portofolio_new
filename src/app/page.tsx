import { getProfile } from "@/data";
import { ButtonLink, Heading, Section, Tag } from "@/components/ui";

export default async function HomePage() {
  const profile = await getProfile();

  return (
    <>
      <Section id="home" className="pt-24 sm:pt-32">
        <p className="text-fg-muted mb-4 font-mono text-xs tracking-[0.2em] uppercase">
          {profile.location_text ?? "Portfolio"}
        </p>
        <Heading level="h1">{profile.full_name}</Heading>
        <p className="text-fg-muted mt-4 max-w-2xl text-lg">{profile.headline}</p>
        {profile.tagline && (
          <p className="text-fg-muted mt-3 max-w-2xl text-base">{profile.tagline}</p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="#projects">View projects</ButtonLink>
          <ButtonLink href="#contact" variant="secondary">
            Get in touch
          </ButtonLink>
        </div>
        <ul className="mt-10 flex flex-wrap gap-2">
          <Tag>TypeScript</Tag>
          <Tag>Next.js</Tag>
          <Tag>PostgreSQL</Tag>
        </ul>
      </Section>

      <Section id="next" eyebrow="In progress" title="Sections arrive in later steps">
        <p className="text-fg-muted text-sm">
          About, experience, projects, skills, and contact are wired to `src/data` next.
        </p>
      </Section>
    </>
  );
}

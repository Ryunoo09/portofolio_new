import { getProfile } from "@/data";
import { ButtonLink, Heading, Section, Tag } from "@/components/ui";

// Content pages revalidate every 5 minutes (PRD: ISR) so a Supabase edit shows
// up without a redeploy. Layout applies the same value to the header/footer.
export const revalidate = 300;

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

      <Section id="about" eyebrow="About" title="About">
        <p className="text-fg-muted max-w-2xl text-sm">Content arrives in step 17.</p>
      </Section>

      <Section id="experience" eyebrow="Experience" title="Experience">
        <p className="text-fg-muted max-w-2xl text-sm">Content arrives in step 18.</p>
      </Section>

      <Section id="projects" eyebrow="Projects" title="Projects">
        <p className="text-fg-muted max-w-2xl text-sm">Content arrives in step 20.</p>
      </Section>

      <Section id="skills" eyebrow="Skills" title="Skills">
        <p className="text-fg-muted max-w-2xl text-sm">Content arrives in step 22.</p>
      </Section>

      <Section id="contact" eyebrow="Contact" title="Contact">
        <p className="text-fg-muted max-w-2xl text-sm">Content arrives in step 23.</p>
      </Section>
    </>
  );
}

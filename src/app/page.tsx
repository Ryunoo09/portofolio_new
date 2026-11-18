import { Section } from "@/components/ui";
import { Hero } from "@/features/hero";
import { getProfile } from "@/data";

// Content pages revalidate every 5 minutes (PRD: ISR) so a Supabase edit shows
// up without a redeploy. Layout applies the same value to the header/footer.
export const revalidate = 300;

export default async function HomePage() {
  const profile = await getProfile();

  return (
    <>
      <div className="mx-auto w-full max-w-[var(--container-max)] px-6">
        <Hero profile={profile} />
      </div>

      <Section id="about" eyebrow="About" title="About">
        <p className="text-fg-muted max-w-2xl text-sm">Content arrives in step 17.</p>
      </Section>

      <Section id="experience" eyebrow="Experience" title="Experience">
        <p className="text-fg-muted max-w-2xl text-sm">Content arrives in step 17.</p>
      </Section>

      <Section id="projects" eyebrow="Projects" title="Projects">
        <p className="text-fg-muted max-w-2xl text-sm">Content arrives in step 18.</p>
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

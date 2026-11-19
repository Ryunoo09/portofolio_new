import { About } from "@/features/about";
import { Contact } from "@/features/contact";
import { ExperienceTimeline } from "@/features/experience";
import { Hero } from "@/features/hero";
import { ProjectsList } from "@/features/projects";
import { PersonJsonLd } from "@/features/seo";
import { Skills } from "@/features/skills";
import {
  getExperiences,
  getProfile,
  getProjects,
  getSiteSettings,
  getSkills,
  getSocialLinks,
} from "@/data";
import { cvLinks } from "@/lib/cv";

// Content pages revalidate every 5 minutes (PRD: ISR) so a Supabase edit shows
// up without a redeploy. Layout applies the same value to the header/footer.
export const revalidate = 300;

export default async function HomePage() {
  const [profile, experiences, projects, skills, socials, settings] = await Promise.all([
    getProfile(),
    getExperiences(),
    getProjects(),
    getSkills(),
    getSocialLinks(),
    getSiteSettings(),
  ]);

  return (
    <>
      <PersonJsonLd profile={profile} socials={socials} />

      <div className="mx-auto w-full max-w-[var(--container-max)] px-6">
        <Hero profile={profile} cv={cvLinks(settings)} />
      </div>

      <About profile={profile} />

      <ExperienceTimeline experiences={experiences} />

      <ProjectsList projects={projects} />

      <Skills skills={skills} />

      <Contact profile={profile} socials={socials} settings={settings} />
    </>
  );
}

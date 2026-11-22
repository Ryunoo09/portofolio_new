import { About } from "@/features/about";
import { Contact } from "@/features/contact";
import { Certificates } from "@/features/certificates";
import { ExperienceTimeline } from "@/features/experience";
import { Hero } from "@/features/hero";
import { ProjectsList } from "@/features/projects";
import { PersonJsonLd } from "@/features/seo";
import { Skills } from "@/features/skills";
import {
  getExperiences,
  getCertificates,
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
  const [profile, experiences, projects, certificates, skills, socials, settings] = await Promise.all([
    getProfile(),
    getExperiences(),
    getProjects(),
    getCertificates(),
    getSkills(),
    getSocialLinks(),
    getSiteSettings(),
  ]);

  return (
    <>
      <PersonJsonLd profile={profile} socials={socials} skills={skills} />

      <div className="mx-auto w-full max-w-[var(--container-max)] px-6">
        <Hero profile={profile} cv={cvLinks(settings)} />
      </div>

      <div className="section-stack">
        <About profile={profile} />
        <div className="section-rule" aria-hidden="true" />
        <ExperienceTimeline experiences={experiences} />
        <div className="section-rule" aria-hidden="true" />
        <ProjectsList projects={projects} />
        <div className="section-rule" aria-hidden="true" />
        <Certificates certificates={certificates} />
        <div className="section-rule" aria-hidden="true" />
        <div className="stack-hold">
          <div className="stack-hold-panel">
            <Skills skills={skills} />
          </div>
          <div className="section-rule" aria-hidden="true" />
          <div className="stack-hold-card">
            <Contact profile={profile} socials={socials} settings={settings} />
          </div>
        </div>
      </div>
    </>
  );
}

import { ButtonLink, Heading } from "@/components/ui";
import { CvDownloadLink } from "@/components/cv-download-link";
import type { Profile } from "@/types/content";
import { CONTACT_LABEL } from "@/lib/seo";
import { HeroVisual } from "./hero-visual";

type HeroProps = {
  profile: Profile;
};

/**
 * First screen for US-01: who the owner is, which role they target, and the two
 * actions a recruiter needs. All text is server-rendered.
 */
export function Hero({ profile }: HeroProps) {
  return (
    <section
      id="home"
      aria-labelledby="home-owner home-title"
      className="hero-shell"
    >
      <div className="hero-copy">
        <p id="home-owner" className="text-fg-muted font-mono text-xs tracking-[0.16em]">
          {profile.full_name}
        </p>

        <Heading level="h1" className="hero-title mt-3">
          <span id="home-title">{profile.headline}</span>
        </Heading>

        <p className="text-fg-muted hero-pitch">{profile.tagline ?? profile.summary_short}</p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <CvDownloadLink className="hero-cta px-5 py-3" />
          <ButtonLink href="#contact" variant="secondary">
            {CONTACT_LABEL}
          </ButtonLink>
        </div>
      </div>

      <HeroVisual />
    </section>
  );
}

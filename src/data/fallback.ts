import experiencesJson from "../../content/experiences.json";
import profileJson from "../../content/profile.json";
import projectMediaJson from "../../content/project-media.json";
import projectsJson from "../../content/projects.json";
import siteSettingsJson from "../../content/site-settings.json";
import skillsJson from "../../content/skills.json";
import socialLinksJson from "../../content/social-links.json";
import type {
  Experience,
  Profile,
  Project,
  ProjectMedia,
  SiteSettings,
  Skill,
  SocialLink,
} from "@/types/content";

export const fallbackProfile = profileJson as Profile;
export const fallbackSocialLinks = socialLinksJson as SocialLink[];
export const fallbackExperiences = experiencesJson as Experience[];
export const fallbackProjects = projectsJson as Project[];
export const fallbackProjectMedia = projectMediaJson as ProjectMedia[];
export const fallbackSkills = skillsJson as Skill[];
export const fallbackSiteSettings = siteSettingsJson as SiteSettings;

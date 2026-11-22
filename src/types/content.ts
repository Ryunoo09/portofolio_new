export type Profile = {
  id: string;
  full_name: string;
  headline: string;
  tagline: string | null;
  summary_short: string | null;
  about_md: string | null;
  location_text: string | null;
  email_public: string;
  avatar_path: string | null;
  cv_path: string | null;
};

export type SocialLink = {
  id: string;
  label: string;
  url: string;
  icon: string | null;
  sort_order: number;
};

export type Experience = {
  id: string;
  role: string;
  organization: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  bullets: string[];
  tech: string[];
  sort_order: number;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description_md: string | null;
  role: string | null;
  year: number | null;
  tech: string[];
  repo_url: string | null;
  live_url: string | null;
  is_private: boolean;
  cover_path: string | null;
  is_published: boolean;
  sort_order: number;
};

export type ProjectMedia = {
  id: string;
  project_id: string;
  path: string;
  alt: string;
  sort_order: number;
};

export type ProjectWithMedia = Project & { media: ProjectMedia[] };

export type Skill = {
  id: string;
  name: string;
  category: string;
  icon: string | null;
  sort_order: number;
};

export type Certificate = {
  id: string;
  title: string;
  issuer: string;
  year: number;
  summary: string;
  image_path: string | null;
  verification_url: string | null;
  sort_order: number;
};

/** Rows from site_settings, keyed by setting name. Values are JSON. */
export type SiteSettings = Record<string, unknown>;

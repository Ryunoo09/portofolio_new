import type { SupabaseClient } from "@supabase/supabase-js";
import { hasSupabaseConfig, getSupabaseClient } from "@/lib/supabase";
import type {
  Experience,
  Profile,
  Project,
  ProjectMedia,
  ProjectWithMedia,
  SiteSettings,
  Skill,
  SocialLink,
} from "@/types/content";
import {
  fallbackExperiences,
  fallbackProfile,
  fallbackProjectMedia,
  fallbackProjects,
  fallbackSiteSettings,
  fallbackSkills,
  fallbackSocialLinks,
} from "./fallback";
type DbResult<T> = { data: T | null; error: { message: string } | null };

/**
 * Every page that reads content must export this, so a Supabase edit shows up
 * within 5 minutes without a redeploy (PRD: ISR revalidate = 300).
 * Route-level config: supabase-js is not fetch-cached per query, Next refreshes
 * the whole prerendered route after this many seconds.
 */
export const REVALIDATE_SECONDS = 300;

/**
 * Runs a Supabase read and returns null on any failure so callers fall back to
 * content/*.json. A failed database must never turn into a 5xx page (R5).
 */
async function attempt<T>(run: (db: SupabaseClient) => Promise<DbResult<T>>): Promise<T | null> {
  if (!hasSupabaseConfig()) return null;

  try {
    const { data, error } = await run(getSupabaseClient());

    if (error) {
      console.warn(`[data] Supabase query failed, using fallback: ${error.message}`);
      return null;
    }

    return data;
  } catch (error) {
    console.warn("[data] Supabase unavailable, using fallback", error);
    return null;
  }
}

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) =>
  a.sort_order - b.sort_order;

const newestFirst = (a: Experience, b: Experience) =>
  b.start_date.localeCompare(a.start_date) || a.sort_order - b.sort_order;

export async function getProfile(): Promise<Profile> {
  const profile = await attempt<Profile>(async (db) => {
    const { data, error } = await db.from("profile").select("*").limit(1).maybeSingle();
    return {
      data: data as Profile | null,
      error: error ? { message: error.message } : null,
    };
  });

  return profile ?? fallbackProfile;
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  const links = await attempt<SocialLink[]>(async (db) => {
    const { data, error } = await db.from("social_links").select("*").order("sort_order");
    return {
      data: data as SocialLink[] | null,
      error: error ? { message: error.message } : null,
    };
  });

  return (links ?? fallbackSocialLinks).slice().sort(bySortOrder);
}

export async function getExperiences(): Promise<Experience[]> {
  const experiences = await attempt<Experience[]>(async (db) => {
    const { data, error } = await db.from("experiences").select("*").order("sort_order");
    return {
      data: data as Experience[] | null,
      error: error ? { message: error.message } : null,
    };
  });

  return (experiences ?? fallbackExperiences).slice().sort(newestFirst);
}

export async function getProjects(): Promise<Project[]> {
  const projects = await attempt<Project[]>(async (db) => {
    const { data, error } = await db
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("sort_order");
    return {
      data: data as Project[] | null,
      error: error ? { message: error.message } : null,
    };
  });

  return (projects ?? fallbackProjects.filter((project) => project.is_published))
    .slice()
    .sort(bySortOrder);
}

export async function getProject(slug: string): Promise<ProjectWithMedia | null> {
  const project = await attempt<Project>(async (db) => {
    const { data, error } = await db
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    return {
      data: data as Project | null,
      error: error ? { message: error.message } : null,
    };
  });

  if (project) {
    const media = await attempt<ProjectMedia[]>(async (db) => {
      const { data, error } = await db
        .from("project_media")
        .select("*")
        .eq("project_id", project.id)
        .order("sort_order");
      return {
        data: (data as ProjectMedia[] | null) ?? [],
        error: error ? { message: error.message } : null,
      };
    });

    return { ...project, media: (media ?? []).slice().sort(bySortOrder) };
  }

  const fallback = fallbackProjects.find(
    (candidate) => candidate.slug === slug && candidate.is_published,
  );

  if (!fallback) return null;

  const media = fallbackProjectMedia
    .filter((item) => item.project_id === fallback.id)
    .slice()
    .sort(bySortOrder);

  return { ...fallback, media };
}

export async function getSkills(): Promise<Skill[]> {
  const skills = await attempt<Skill[]>(async (db) => {
    const { data, error } = await db.from("skills").select("*").order("sort_order");
    return {
      data: data as Skill[] | null,
      error: error ? { message: error.message } : null,
    };
  });

  return (skills ?? fallbackSkills).slice().sort(bySortOrder);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await attempt<{ key: string; value: unknown }[]>(async (db) => {
    const { data, error } = await db.from("site_settings").select("key,value");
    return {
      data: data as { key: string; value: unknown }[] | null,
      error: error ? { message: error.message } : null,
    };
  });

  if (!rows) return fallbackSiteSettings;

  // Merge per key so a missing row keeps the fallback value.
  return rows.reduce<SiteSettings>((settings, row) => ({ ...settings, [row.key]: row.value }), {
    ...fallbackSiteSettings,
  });
}

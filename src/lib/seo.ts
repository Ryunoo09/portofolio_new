/**
 * Site-level SEO constants.
 * ponytail: SITE_URL follows NEXT_PUBLIC_SITE_URL; domain decision (Q1) only changes that env value.
 */
import { getSiteUrl } from "./env";

export const SITE_URL = getSiteUrl();

export const SITE_NAME = "Rakha Yuda Wicaksono";

export const SITE_TITLE = "Rakha Yuda Wicaksono - Software Engineer";

export const SITE_DESCRIPTION =
  "Portfolio of Rakha Yuda Wicaksono, a software engineer building reliable web systems with a focus on backend, data modelling, and clean, accessible interfaces.";

// Both CTA labels live here because they appear twice: header (primary, always
// visible to recruiters) and hero (repeated for the first-screen click path).
export const CV_LABEL = "Download CV";

export const CONTACT_LABEL = "Contact";

/** Absolute URL for a site path, used by the sitemap and by JSON-LD. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

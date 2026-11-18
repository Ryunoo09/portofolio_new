/**
 * Site-level SEO constants.
 * ponytail: SITE_URL follows NEXT_PUBLIC_SITE_URL; domain decision (Q1) only changes that env value.
 */
import { getSiteUrl } from "./env";

export const SITE_URL = getSiteUrl();

export const SITE_NAME = "Rakha Yuda Wicaksono";

export const SITE_TITLE = "Rakha Yuda Wicaksono - Software Engineer";

export const SITE_DESCRIPTION =
  "Portfolio of Rakha Yuda Wicaksono, a software engineer building reliable web systems with a focus on backend, data, and clean interfaces.";

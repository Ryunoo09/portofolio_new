import { getProfile } from "@/data";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/features/seo/og";
import { truncate } from "@/lib/format";
import { SITE_NAME } from "@/lib/seo";

// Same 5 minute window as the page: a Supabase edit reaches the preview too.
export const revalidate = 300;

export const alt = `${SITE_NAME}, Software Engineer`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function OpengraphImage() {
  const profile = await getProfile();
  const blurb = profile.tagline ?? profile.summary_short ?? "";

  return renderOgImage({
    eyebrow: profile.headline,
    title: profile.full_name,
    footer: truncate(blurb, 96),
    note: "Portfolio",
  });
}
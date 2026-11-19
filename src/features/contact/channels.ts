import type { SiteSettings } from "@/types/content";

type Channel = "phone" | "whatsapp";

/** Loose on formatting, strict on shape: a value that cannot be dialled is not shown. */
const NUMBER_PATTERN = /^\+?[\d][\d\s()-]{5,}$/;

/**
 * US-06: phone and WhatsApp stay off the page unless the owner sets
 * `contact.phone_public` / `contact.whatsapp_public` to true in site_settings.
 * The default is off, and a malformed number is treated as off.
 */
function publicNumber(settings: SiteSettings, channel: Channel): string | null {
  const contact = settings.contact;

  if (!contact || typeof contact !== "object") return null;

  const record = contact as Record<string, unknown>;

  if (record[`${channel}_public`] !== true) return null;

  const value = record[channel];

  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  return NUMBER_PATTERN.test(trimmed) ? trimmed : null;
}

export function publicPhone(settings: SiteSettings): string | null {
  return publicNumber(settings, "phone");
}

export function publicWhatsapp(settings: SiteSettings): string | null {
  return publicNumber(settings, "whatsapp");
}

/** `tel:` keeps the `+` and drops the formatting the owner typed. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** wa.me only accepts digits, without a leading plus. */
export function whatsappHref(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

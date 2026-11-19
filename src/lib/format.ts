const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

type Month = { year: string; label: string };

/** Parses the date-only strings Supabase returns ("2024-01-01"). */
function parseMonth(isoDate: string): Month {
  const [year = "", month = ""] = isoDate.split("-");
  const label = MONTHS[Number(month) - 1] ?? "";
  return { year, label };
}

/**
 * Always names both years so a range is never ambiguous:
 * "Jan 2023 – Dec 2023", "Nov 2022 – Mar 2024", "Mar 2024 – Present".
 */
export function formatDateRange(startDate: string, endDate: string | null): string {
  if (!endDate) return `${formatMonthYear(startDate)} – Present`;

  return `${formatMonthYear(startDate)} – ${formatMonthYear(endDate)}`;
}

/** A single "Mon YYYY" label, e.g. for a `<time>` element's text content. */
export function formatMonthYear(isoDate: string): string {
  const { year, label } = parseMonth(isoDate);

  return `${label} ${year}`;
}

/** Cuts on a word boundary within `maxLength` characters. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  // Reserve the three characters the ellipsis needs so the result never exceeds
  // the cap (a word-boundary cut plus the ellipsis could otherwise overshoot).
  const clipped = text.slice(0, Math.max(0, maxLength - 3));
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}

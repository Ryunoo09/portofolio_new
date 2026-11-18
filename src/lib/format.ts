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
  const start = parseMonth(startDate);
  if (!endDate) return `${start.label} ${start.year} – Present`;

  const end = parseMonth(endDate);
  return `${start.label} ${start.year} – ${end.label} ${end.year}`;
}

/** Cuts on a word boundary within `maxLength` characters. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const clipped = text.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}

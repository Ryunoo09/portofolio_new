import { buttonClassName } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { CvLinks } from "@/lib/cv";
import { CV_LABEL } from "@/lib/seo";

type Language = "en" | "id";

const LANGUAGE_NAMES: Record<Language, string> = { en: "English", id: "Indonesian" };

type CvDownloadMenuProps = {
  cv: CvLinks;
  className?: string;
  /** Accent button (hero, header), a plain text row (mobile menu), or icon only (dock). */
  variant?: "button" | "plain" | "icon";
  onClick?: () => void;
};

/**
 * "Download CV" opens a native disclosure with one row per language. `<details>`
 * keeps it keyboard-accessible with no client state, and the menu starts closed
 * so neither language is presented as the default. Renders nothing when both
 * files are missing, rather than shipping a dead CTA.
 */
export function CvDownloadMenu({
  cv,
  className,
  variant = "button",
  onClick,
}: CvDownloadMenuProps) {
  const files: { language: Language; href: string; label: string }[] = [];

  if (cv.en) files.push({ language: "en", href: cv.en, label: "EN" });
  if (cv.id) files.push({ language: "id", href: cv.id, label: "ID" });

  if (files.length === 0) return null;

  return (
    <details className={cn("group relative", variant === "plain" && "w-full")}>
      <summary
        aria-label="Download CV"
        title="Download CV"
        className={cn(
          "cursor-pointer select-none",
          variant === "icon"
            ? "nav-dock-item list-none flex items-center justify-center [&::-webkit-details-marker]:hidden"
            : "after:border-current after:h-1.5 after:w-1.5 after:rotate-45 after:border-r after:border-b after:content-[''] after:transition-transform after:duration-[var(--duration-fast)] group-open:after:rotate-[225deg]",
          variant === "button" ? buttonClassName("primary") : variant === "plain" ? "inline-flex items-center gap-2 text-sm font-medium" : "",
          className,
        )}
      >
        {variant === "icon" ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        ) : (
          CV_LABEL
        )}
      </summary>

      <ul
        className={cn(
          "border-border bg-bg rounded-md border p-1 shadow-lg",
          variant === "button" || variant === "icon"
            ? "absolute top-full right-0 z-[var(--z-nav)] mt-2 min-w-28"
            : "mt-1",
        )}
      >
        {files.map((file) => (
          <li key={file.language}>
            <a
              href={file.href}
              onClick={onClick}
              aria-label={`Download CV in ${LANGUAGE_NAMES[file.language]}`}
              className="text-fg-muted hover:text-fg hover:bg-surface-raised block rounded-sm px-3 py-2 text-sm font-medium"
            >
              {file.label}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

import { buttonClassName } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { CvLinks } from "@/lib/cv";
import { CV_LABEL } from "@/lib/seo";

type Language = "en" | "id";

const LANGUAGE_NAMES: Record<Language, string> = { en: "English", id: "Indonesian" };

type CvDownloadMenuProps = {
  cv: CvLinks;
  className?: string;
  /** Accent button (hero, header) or a plain text row (mobile menu). */
  variant?: "button" | "plain";
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
        className={cn(
          "cursor-pointer select-none",
          "after:border-current after:h-1.5 after:w-1.5 after:rotate-45 after:border-r after:border-b after:content-[''] after:transition-transform after:duration-[var(--duration-fast)] group-open:after:rotate-[225deg]",
          variant === "button" ? buttonClassName("primary") : "inline-flex items-center gap-2 text-sm font-medium",
          className,
        )}
      >
        {CV_LABEL}
      </summary>

      <ul
        className={cn(
          "border-border bg-bg rounded-md border p-1 shadow-lg",
          variant === "button" ? "absolute top-full right-0 z-[var(--z-nav)] mt-2 min-w-28" : "mt-1",
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

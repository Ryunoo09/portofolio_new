import { buttonClassName } from "@/components/ui";
import { CV_DOWNLOAD_HREF, CV_FILE_NAME } from "@/lib/cv";
import { CV_LABEL } from "@/lib/seo";
import { cn } from "@/lib/cn";

type CvDownloadLinkProps = {
  className?: string;
  /** Accent button (hero, header) or a plain text row (mobile menu). */
  variant?: "button" | "plain";
  onClick?: () => void;
};

/**
 * The CV download, used in three places (hero, desktop nav, mobile menu) so the
 * label, path, and `download` attribute can never drift apart.
 * A plain `<a download>`: `next/link` only prefetches routes, not files.
 */
export function CvDownloadLink({ className, variant = "button", onClick }: CvDownloadLinkProps) {
  return (
    <a
      href={CV_DOWNLOAD_HREF}
      download={CV_FILE_NAME}
      onClick={onClick}
      className={cn(
        variant === "button" ? buttonClassName("primary") : "text-sm font-medium",
        className,
      )}
    >
      {CV_LABEL}
    </a>
  );
}

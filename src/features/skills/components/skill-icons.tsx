import type { SVGProps } from "react";

type SkillIconProps = {
  name: string;
  category?: string;
} & SVGProps<SVGSVGElement>;

export function SkillIcon({ name, category, ...props }: SkillIconProps) {
  const common = {
    width: "1.25rem",
    height: "1.25rem",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": "true" as const,
    ...props,
  };

  switch (name.toLowerCase()) {
    case "python":
      return (
        <svg {...common}>
          <path d="M12 2C6.5 2 7 4.5 7 4.5V7h5v1H5s-3-.5-3 5 2.5 5.5 2.5 5.5H6v-2.5s-.5-3 3-3h5s2.5 0 2.5-2.5V4.5S17 2 12 2z" />
          <circle cx="9" cy="4.5" r="0.75" fill="currentColor" />
          <path d="M12 22c5.5 0 5-2.5 5-2.5V17h-5v-1h7s3 .5 3-5-2.5-5.5-2.5-5.5H18v2.5s.5 3-3 3H10s-2.5 0-2.5 2.5v6S7 22 12 22z" />
          <circle cx="15" cy="19.5" r="0.75" fill="currentColor" />
        </svg>
      );
    case "php":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="12" rx="10" ry="6" />
          <path d="M7 10v4M7 10h2a1.5 1.5 0 0 1 0 3H7M11 10v4M15 10v4M15 10h2a1.5 1.5 0 0 1 0 3h-2" />
        </svg>
      );
    case "javascript":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M8 15v2a2 2 0 0 0 2 2M14 17a2 2 0 0 0 2-2v-1a1.5 1.5 0 0 0-1.5-1.5h-1a1.5 1.5 0 0 1-1.5-1.5V10a2 2 0 0 1 2-2h1" />
        </svg>
      );
    case "typescript":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M6 9h6M9 9v9M14 17a2 2 0 0 0 2-2v-1a1.5 1.5 0 0 0-1.5-1.5h-1a1.5 1.5 0 0 1-1.5-1.5V10a2 2 0 0 1 2-2h1" />
        </svg>
      );
    case "laravel":
      return (
        <svg {...common}>
          <path d="M4 17l6 3 10-5V5l-6-3L4 7v10z" />
          <path d="M10 20V9l10-4M4 7l10 5" />
        </svg>
      );
    case "fastapi":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <polygon points="13 4 7 14 12 14 11 20 17 10 12 10 13 4" fill="currentColor" />
        </svg>
      );
    case "react":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="12" rx="10" ry="4" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    case "flutter":
      return (
        <svg {...common}>
          <path d="M14 2L4 12l3 3L17 5h4L14 2zM14 14l-4 4 4 4h7l-7-7 7-7h-7l-4 4z" />
        </svg>
      );
    case "tailwind css":
      return (
        <svg {...common}>
          <path d="M6 12c1.5-3 3.5-3.5 6-1.5 2 1.6 3 2 5 .5-1.5 3-3.5 3.5-6 1.5-2-1.6-3-2-5-.5zm-4 5c1.5-3 3.5-3.5 6-1.5 2 1.6 3 2 5 .5-1.5 3-3.5 3.5-6 1.5-2-1.6-3-2-5-.5z" />
        </svg>
      );
    case "bootstrap":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <path d="M9 7h4a2.5 2.5 0 0 1 0 5H9V7zm0 5h4.5a2.5 2.5 0 0 1 0 5H9v-5z" />
        </svg>
      );
    case "postgresql":
    case "sqlite":
    case "redis":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case "n8n":
    case "knime":
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="12" cy="18" r="3" />
          <line x1="8.5" y1="7.5" x2="15.5" y2="7.5" />
          <line x1="7.5" y1="8.5" x2="10.5" y2="15.5" />
          <line x1="16.5" y1="8.5" x2="13.5" y2="15.5" />
        </svg>
      );
    case "docker":
      return (
        <svg {...common}>
          <rect x="3" y="10" width="3" height="3" />
          <rect x="7" y="10" width="3" height="3" />
          <rect x="11" y="10" width="3" height="3" />
          <rect x="7" y="6" width="3" height="3" />
          <rect x="11" y="6" width="3" height="3" />
          <path d="M2 13c1.5 5 6 7 11 7 5.5 0 8.5-3 9-6-2.5-.5-6 1-9-1-2-1.3-4-1-6 0z" />
        </svg>
      );
    case "git":
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="9" r="3" />
          <line x1="6" y1="9" x2="6" y2="15" />
          <path d="M6 9a9 9 0 0 1 9 3" />
        </svg>
      );
    case "nginx":
      return (
        <svg {...common}>
          <polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2" />
          <path d="M8 8v8l8-8v8" />
        </svg>
      );
    case "cloudflare":
      return (
        <svg {...common}>
          <path d="M17.5 19H7a5 5 0 0 1-1-9.9 6 6 0 0 1 11.5-1.5A4.5 4.5 0 0 1 17.5 19z" />
        </svg>
      );
    case "ubuntu":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="4" r="1.5" />
          <circle cx="5" cy="16" r="1.5" />
          <circle cx="19" cy="16" r="1.5" />
        </svg>
      );
    case "apache spark (pyspark)":
    case "spark mllib":
      return (
        <svg {...common}>
          <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
        </svg>
      );
    case "scikit-learn":
    case "yolo":
      return (
        <svg {...common}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "pandas & numpy":
    case "jupyter / colab":
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <line x1="8" y1="7" x2="16" y2="7" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="8" y1="17" x2="12" y2="17" />
        </svg>
      );
    case "paddleocr":
      return (
        <svg {...common}>
          <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
          <line x1="7" y1="12" x2="17" y2="12" />
        </svg>
      );
    case "rest apis":
    case "rest api":
      return (
        <svg {...common}>
          <line x1="4" y1="8" x2="20" y2="8" />
          <polyline points="16 4 20 8 16 12" />
          <line x1="20" y1="16" x2="4" y2="16" />
          <polyline points="8 12 4 16 8 20" />
        </svg>
      );
    default:
      if (category === "Languages" || category === "Frameworks & Libraries") {
        return (
          <svg {...common}>
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        );
      }
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <line x1="9" y1="9" x2="15" y2="15" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </svg>
      );
  }
}

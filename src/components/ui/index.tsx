import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { RevealWords } from "@/features/motion";
import { cn } from "@/lib/cn";

export type HeadingLevel = "h1" | "h2" | "h3";

const headingStyles: Record<HeadingLevel, string> = {
  h1: "font-display text-4xl tracking-tight sm:text-5xl md:text-6xl",
  h2: "font-display text-3xl tracking-tight sm:text-4xl",
  h3: "text-fg text-lg font-medium tracking-tight",
};

type HeadingProps = {
  level: HeadingLevel;
  children: ReactNode;
  className?: string;
};

/** Keeps heading order explicit: callers pass the level they render. */
export function Heading({ level, children, className }: HeadingProps) {
  const Tag = level;

  return (
    <Tag className={cn("text-fg text-balance", headingStyles[level], className)}>{children}</Tag>
  );
}

type SectionProps = {
  id: string;
  title?: ReactNode;
  eyebrow?: string;
  description?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Section({ id, title, eyebrow, description, className, children }: SectionProps) {
  const titleId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={title ? titleId : undefined}
      className={cn("mx-auto w-full max-w-[var(--container-max)] px-6 py-16 sm:py-24", className)}
    >
      {(eyebrow || title || description) && (
        <header className="section-head mb-10 max-w-2xl">
          {eyebrow && (
            <p className="text-fg-muted mb-3 font-mono text-xs tracking-[0.2em] uppercase">
              {eyebrow}
            </p>
          )}
          {title && (
            <Heading level="h2" className="mb-3">
              <span id={titleId}>
                {typeof title === "string" ? <RevealWords text={title} /> : title}
              </span>
            </Heading>
          )}
          {description && <p className="text-fg-muted text-base">{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

type TagProps = {
  children: ReactNode;
  className?: string;
};

export function Tag({ children, className }: TagProps) {
  return (
    <li
      className={cn(
        "border-border bg-surface-raised text-fg-muted rounded-sm border px-2 py-1 font-mono text-xs",
        className,
      )}
    >
      {children}
    </li>
  );
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors duration-[var(--duration-fast)] disabled:pointer-events-none disabled:opacity-50";

const buttonVariants = {
  primary: "bg-accent text-accent-fg hover:opacity-90",
  secondary: "border border-border-strong text-fg hover:bg-surface-raised",
  ghost: "text-fg-muted hover:text-fg",
} as const;

type ButtonVariant = keyof typeof buttonVariants;

/**
 * Button styling for non-button elements (e.g. a download link that must not use
 * `next/link`). Keeps every accent action visually in one family.
 */
export function buttonClassName(variant: ButtonVariant = "primary", className?: string) {
  return cn(buttonBase, buttonVariants[variant], className);
}

type ButtonProps = Omit<ComponentProps<"button">, "className"> & {
  variant?: ButtonVariant;
  className?: string;
};

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClassName(variant, className)} {...props} />;
}

type ButtonLinkProps = {
  href: string;
  variant?: ButtonVariant;
  /** Opens in a new tab with the matching `rel`. */
  external?: boolean;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
};

export function ButtonLink({
  href,
  variant = "primary",
  external = false,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const classes = buttonClassName(variant, className);

  if (external) {
    return (
      <a href={href} className={classes} rel="noreferrer noopener" target="_blank" {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}

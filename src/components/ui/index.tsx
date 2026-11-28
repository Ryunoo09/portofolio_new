import Link from "next/link";
import type { ReactNode } from "react";
import { RevealWords } from "@/features/motion";
import { cn } from "@/lib/cn";

export type HeadingLevel = "h1" | "h2" | "h3";

const headingStyles: Record<HeadingLevel, string> = {
  h1: "font-display text-4xl tracking-tight sm:text-5xl md:text-6xl",
  h2: "font-display text-4xl tracking-tight sm:text-5xl",
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
  layout?: "stack" | "split";
  align?: "left" | "center";
  children: ReactNode;
};

export function Section({
  id,
  title,
  eyebrow,
  description,
  className,
  layout = "stack",
  align = "left",
  children,
}: SectionProps) {
  const titleId = `${id}-title`;
  const isSplit = layout === "split";
  const isCenter = align === "center";

  return (
    <section
      id={id}
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        "mx-auto w-full max-w-[var(--container-max)] px-6 py-16 sm:py-20",
        isSplit && "lg:grid lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-x-12 lg:items-start",
        className,
      )}
    >
      {(eyebrow || title || description) && (
        <header
          className={cn(
            "section-head mb-10 max-w-2xl",
            isCenter && "mx-auto text-center",
            isSplit && "lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:mb-0",
          )}
        >
          {eyebrow && (
            <p className="text-fg-muted mb-3 font-mono text-xs tracking-[0.2em] uppercase">
              {eyebrow}
            </p>
          )}
          {title && (
            <Heading level="h2" className={cn("mb-3", isCenter && "text-center")}>
              <span id={titleId}>
                {typeof title === "string" ? <RevealWords text={title} /> : title}
              </span>
            </Heading>
          )}
          {description && (
            <p className={cn("text-fg-muted text-base", isCenter && "max-w-xl mx-auto text-balance")}>
              {description}
            </p>
          )}
        </header>
      )}
      {isSplit ? <div className="min-w-0">{children}</div> : children}
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

import {
  Button as ShadcnButton,
  type ButtonProps as ShadcnButtonProps,
  buttonVariants as shadcnButtonVariants,
} from "./button";

export { ShadcnButton as Button, shadcnButtonVariants as buttonVariants };
export type { ShadcnButtonProps as ButtonProps };

type ButtonVariantLegacy = "primary" | "secondary" | "ghost" | "default" | "outline" | "link";

export function buttonClassName(variant: ButtonVariantLegacy = "primary", className?: string) {
  const mappedVariant = variant === "primary" ? "default" : variant;
  return shadcnButtonVariants({ variant: mappedVariant, className });
}

type ButtonLinkProps = {
  href: string;
  variant?: ButtonVariantLegacy;
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
  const mappedVariant = variant === "primary" ? "default" : variant;

  if (external) {
    return (
      <ShadcnButton asChild variant={mappedVariant} className={className}>
        <a href={href} rel="noreferrer noopener" target="_blank" {...rest}>
          {children}
        </a>
      </ShadcnButton>
    );
  }

  return (
    <ShadcnButton asChild variant={mappedVariant} className={className}>
      <Link href={href} {...rest}>
        {children}
      </Link>
    </ShadcnButton>
  );
}

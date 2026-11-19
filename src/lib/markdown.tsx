import { Fragment, type ReactNode } from "react";

/**
 * Minimal Markdown renderer for the small subset the owner writes in
 * `profile.about_md`: paragraphs, **bold**, *italic*, `code`, and [links](url).
 *
 * Renders React elements, never an HTML string, so no value from the database can
 * inject markup. Deliberately not a full Markdown implementation: a general parser
 * would be a new dependency for content that is a few paragraphs long.
 */

/**
 * Ordered alternation: bold before italic (so `**x**` is not read as italic), and
 * a link URL may contain one level of balanced parentheses so
 * `[x](https://en.wikipedia.org/wiki/Foo_(bar))` stays intact.
 * The label excludes `[` as well as `]`, which keeps the match linear: allowing
 * two overlapping unbounded repeats made long runs of `[` quadratic (seconds of
 * server render time on a pathological bio).
 * Bold also accepts a single `*italic*` run inside it, so `**a *b* c**` keeps its
 * bold instead of collapsing into stray asterisks.
 */
const INLINE_PATTERN =
  /(\*\*(?:[^*]|\*[^*]+\*)+?\*\*|\*[^*]+\*|`[^`]+`|\[[^\]\[]+\]\((?:[^()\s]|\([^()\s]*\))*\))/g;

/**
 * Only http(s), mailto, absolute paths, and hashes may become an href.
 * Protocol-relative URLs (`//evil.com`) and backslash tricks (`/\evil.com`) are
 * rejected too, so a link can never silently leave the site's origin.
 */
function isSafeHref(href: string): boolean {
  if (href.startsWith("//")) return false;
  if (href.startsWith("/") && href.includes("\\")) return false;

  return /^(https?:\/\/|mailto:|\/|#)/i.test(href);
}

function renderLink(part: string, key: string): ReactNode {
  const parsed = /^\[([^\]]+)\]\(([\s\S]+)\)$/.exec(part);
  // The split pattern and this pattern agree, so anything reaching here is a link.
  if (!parsed) return part;

  const [, label, href] = parsed;
  // A rejected URL keeps its text and loses the link, rather than vanishing.
  if (!isSafeHref(href)) return label;

  const external = /^https?:\/\//i.test(href);

  return (
    <a
      key={key}
      href={href}
      className="text-fg underline underline-offset-4"
      {...(external ? { rel: "noreferrer noopener", target: "_blank" } : {})}
    >
      {renderInline(label, `${key}-l`)}
    </a>
  );
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text
    .split(INLINE_PATTERN)
    .filter((part) => part.length > 0)
    .map((part, index): ReactNode => {
      const key = `${keyPrefix}-${index}`;

      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={key}>{renderInline(part.slice(2, -2), `${key}-b`)}</strong>;
      }
      if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) {
        return <em key={key}>{part.slice(1, -1)}</em>;
      }
      if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
        return <code key={key}>{part.slice(1, -1)}</code>;
      }
      if (part.startsWith("[")) {
        return renderLink(part, key) ?? part;
      }

      return part;
    });
}

/**
 * A `##`/`###` line becomes a real heading, which is how case studies mark their
 * Problem / Role / Result blocks. Text on the following lines, even without a
 * blank line, stays a paragraph. `#` is left as text because the page owns its
 * single `h1`. Headings keep the styles of `components/ui`'s `Heading`.
 */
function renderBlock(block: string, index: number): ReactNode {
  const [firstLine = "", ...rest] = block.split("\n");
  const heading = /^(#{2,3})\s+(.+)$/.exec(firstLine);

  if (!heading) {
    return <p key={`p-${index}`}>{renderInline(block, `b${index}`)}</p>;
  }

  const isTop = heading[1] === "##";
  const Tag = isTop ? "h2" : "h3";
  const remainder = rest.join("\n").trim();

  return (
    <Fragment key={`b-${index}`}>
      <Tag
        className={
          isTop
            ? "text-fg font-display text-2xl tracking-tight"
            : "text-fg text-lg font-medium tracking-tight"
        }
      >
        {renderInline(heading[2], `h${index}`)}
      </Tag>
      {remainder.length > 0 && (
        <p key={`p-${index}`}>{renderInline(remainder, `b${index}-rest`)}</p>
      )}
    </Fragment>
  );
}

/** Blank lines separate paragraphs, matching Markdown's block rules. */
export function renderMarkdown(source: string): ReactNode[] {
  return source
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .map(renderBlock);
}

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderMarkdown } from "@/lib/markdown";

function renderSource(source: string) {
  return render(<div>{renderMarkdown(source)}</div>);
}

describe("renderMarkdown", () => {
  it("splits blank-line separated blocks into paragraphs", () => {
    const { container } = renderSource("First para.\n\nSecond para.");

    const paragraphs = container.querySelectorAll("p");

    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toHaveTextContent("First para.");
    expect(paragraphs[1]).toHaveTextContent("Second para.");
  });

  it("ignores leading, trailing, and repeated blank lines", () => {
    const { container } = renderSource("\n\n  Only para.  \n\n\n");

    expect(container.querySelectorAll("p")).toHaveLength(1);
  });

  it("renders bold, italic, and inline code", () => {
    renderSource("A **bold** word, an *italic* word, and `code`.");

    expect(screen.getByText("bold").tagName).toBe("STRONG");
    expect(screen.getByText("italic").tagName).toBe("EM");
    expect(screen.getByText("code").tagName).toBe("CODE");
  });

  it("renders internal links without a new tab", () => {
    renderSource("See [projects](/projects).");

    const link = screen.getByRole("link", { name: "projects" });

    expect(link).toHaveAttribute("href", "/projects");
    expect(link).not.toHaveAttribute("target");
  });

  it("marks external links so they open safely in a new tab", () => {
    renderSource("Visit [GitHub](https://github.com/example).");

    const link = screen.getByRole("link", { name: "GitHub" });

    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer noopener");
  });

  it("never creates an element from raw HTML in the source", () => {
    const { container } = renderSource('<script>alert("x")</script> Not markup.');

    // The text is kept as literal characters; no script node is created.
    expect(container.querySelector("script")).toBeNull();
    expect(container.textContent).toContain('<script>alert("x")</script>');
  });

  it("drops unsafe link targets but keeps their text", () => {
    const { container } = renderSource("Click [here](javascript:alert(1)).");

    expect(container.querySelector("a")).toBeNull();
    // The label survives; no orphaned brackets or stray characters.
    expect(container.textContent).toBe("Click here.");
  });

  it("rejects protocol-relative and backslash targets", () => {
    const { container } = renderSource("[a](//evil.com) [b](/\\evil.com)");

    expect(container.querySelector("a")).toBeNull();
  });

  it("keeps bold text when it contains italic", () => {
    const { container } = renderSource("**a *b* c**");

    const strong = container.querySelector("strong");

    expect(strong).not.toBeNull();
    // No stray asterisks leak into the rendered text.
    expect(strong!.textContent).toBe("a b c");
    expect(strong!.querySelector("em")?.textContent).toBe("b");
  });

  it("renders inline markup inside a link label", () => {
    const { container } = renderSource("[**GitHub**](/x)");

    const link = container.querySelector("a");

    expect(link?.querySelector("strong")?.textContent).toBe("GitHub");
  });

  it("leaves an empty link payload as literal text", () => {
    const { container } = renderSource("[]()");

    expect(container.textContent).toBe("[]()");
    expect(container.querySelector("a")).toBeNull();
  });

  it("stays fast on a long run of unmatched brackets", () => {
    const started = performance.now();
    renderMarkdown("[x".repeat(8000));
    const elapsed = performance.now() - started;

    // Linear matching keeps this in the low milliseconds; a quadratic pattern
    // would take hundreds.
    expect(elapsed).toBeLessThan(300);
  });

  it("returns nothing for empty or whitespace-only input", () => {
    expect(renderMarkdown("")).toHaveLength(0);
    expect(renderMarkdown("   \n\n  ")).toHaveLength(0);
  });
});

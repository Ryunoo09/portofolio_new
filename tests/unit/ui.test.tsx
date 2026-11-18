import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, ButtonLink, Heading, Prose, Section, Tag } from "@/components/ui";

describe("Heading", () => {
  it("renders the requested level without skipping structure", () => {
    render(
      <>
        <Heading level="h1">Name</Heading>
        <Heading level="h2">Work</Heading>
        <Heading level="h3">Role</Heading>
      </>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Name" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Work" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Role" })).toBeInTheDocument();
  });
});

describe("Section", () => {
  it("labels the section by its heading", () => {
    render(
      <Section id="about" eyebrow="About" title="Who I am">
        <p>Body</p>
      </Section>,
    );

    const region = screen.getByRole("region", { name: "Who I am" });

    expect(region).toHaveAttribute("id", "about");
    expect(screen.getByRole("heading", { level: 2, name: "Who I am" })).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("stays a plain landmark when there is no title", () => {
    render(
      <Section id="bare">
        <p>Body</p>
      </Section>,
    );

    expect(screen.getByText("Body").closest("section")).toHaveAttribute("id", "bare");
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
});

describe("Tag", () => {
  it("renders as a list item so tags form a list", () => {
    render(
      <ul>
        <Tag>TypeScript</Tag>
      </ul>,
    );

    expect(screen.getByRole("listitem")).toHaveTextContent("TypeScript");
  });
});

describe("Button", () => {
  it("is keyboard reachable and does not submit a form by default", () => {
    render(<Button>Send</Button>);

    const button = screen.getByRole("button", { name: "Send" });

    expect(button).toHaveAttribute("type", "button");
    button.focus();
    expect(button).toHaveFocus();
  });
});

describe("ButtonLink", () => {
  it("renders internal links without a new tab", () => {
    render(<ButtonLink href="#projects">Projects</ButtonLink>);

    const link = screen.getByRole("link", { name: "Projects" });

    expect(link).toHaveAttribute("href", "#projects");
    expect(link).not.toHaveAttribute("target");
  });

  it("opens external links safely in a new tab", () => {
    render(
      <ButtonLink href="https://example.com" variant="secondary" external>
        CV
      </ButtonLink>,
    );

    const link = screen.getByRole("link", { name: "CV" });

    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer noopener");
  });
});

describe("Prose", () => {
  it("renders trusted html", () => {
    render(<Prose html="<h3>Problem</h3><p>Copy.</p>" />);

    expect(screen.getByRole("heading", { level: 3, name: "Problem" })).toBeInTheDocument();
    expect(screen.getByText("Copy.")).toBeInTheDocument();
  });
});

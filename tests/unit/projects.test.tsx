import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectsList } from "@/features/projects";
import type { Project } from "@/types/content";

function make(overrides: Partial<Project> & Pick<Project, "id" | "slug" | "title">): Project {
  return {
    summary: "A summary.",
    description_md: null,
    role: null,
    year: null,
    tech: ["TypeScript"],
    repo_url: null,
    live_url: null,
    is_private: false,
    cover_path: null,
    is_published: true,
    sort_order: 1,
    ...overrides,
  };
}

describe("ProjectsList", () => {
  it("renders number, title, summary, and a link to the detail page", () => {
    const { container } = render(
      <ProjectsList projects={[make({ id: "a", slug: "alpha", title: "Alpha" })]} />,
    );

    expect(screen.getByRole("heading", { level: 3, name: "Alpha" })).toBeVisible();
    expect(screen.getByText("A summary.")).toBeVisible();
    expect(screen.getByRole("link", { name: "Alpha" })).toHaveAttribute("href", "/projects/alpha");

    // The number is the list position, hidden from assistive tech (the <ol> states it).
    expect(container.querySelector(".project-index")).toHaveTextContent("01");
    expect(container.querySelector(".project-index")).toHaveAttribute("aria-hidden", "true");
  });

  it("numbers rows in order", () => {
    const { container } = render(
      <ProjectsList
        projects={[
          make({ id: "a", slug: "a", title: "A" }),
          make({ id: "b", slug: "b", title: "B" }),
        ]}
      />,
    );

    const numbers = [...container.querySelectorAll(".project-index")].map((node) => node.textContent);

    expect(numbers).toEqual(["01", "02"]);
  });

  it("shows at most five technology tags", () => {
    render(
      <ProjectsList
        projects={[
          make({
            id: "a",
            slug: "a",
            title: "A",
            tech: ["One", "Two", "Three", "Four", "Five", "Six", "Seven"],
          }),
        ]}
      />,
    );

    const list = screen.getByRole("list", { name: "Technologies for A" });

    expect(list.querySelectorAll("li")).toHaveLength(5);
    expect(screen.queryByText("Six")).toBeNull();
  });

  it("labels a project without a public link as Private build", () => {
    const { rerender } = render(<ProjectsList projects={[make({ id: "a", slug: "a", title: "A" })]} />);

    expect(screen.getByText("Private build")).toBeVisible();

    rerender(
      <ProjectsList
        projects={[make({ id: "a", slug: "a", title: "A", live_url: "https://a.example.com" })]}
      />,
    );

    expect(screen.queryByText("Private build")).toBeNull();
  });

  it("follows the public link, not is_private, when deciding the label", () => {
    const { rerender } = render(
      <ProjectsList
        projects={[
          make({
            id: "a",
            slug: "a",
            title: "A",
            is_private: true,
            repo_url: "https://github.com/example/a",
          }),
        ]}
      />,
    );

    // A private-labelled project that still has a repo is not a private build.
    expect(screen.queryByText("Private build")).toBeNull();

    rerender(
      <ProjectsList
        projects={[make({ id: "a", slug: "a", title: "A", repo_url: "javascript:alert(1)" })]}
      />,
    );

    // An unusable scheme is not a public link.
    expect(screen.getByText("Private build")).toBeVisible();
  });

  it("drops outbound links that are not http(s)", () => {
    render(
      <ProjectsList
        projects={[
          make({
            id: "x",
            slug: "x",
            title: "X",
            repo_url: "javascript:alert(1)",
            live_url: "data:text/html,x",
          }),
        ]}
      />,
    );

    expect(screen.queryByRole("link", { name: /Code/ })).toBeNull();
    expect(screen.queryByRole("link", { name: /Live/ })).toBeNull();
  });

  it("renders no preview when a project has no cover image", () => {
    const { container } = render(
      <ProjectsList projects={[make({ id: "a", slug: "a", title: "A" })]} />,
    );

    expect(container.querySelector(".project-preview")).toBeNull();
  });

  it("hides the cover preview from assistive tech and from the link name", () => {
    const { container } = render(
      <ProjectsList projects={[make({ id: "a", slug: "a", title: "A", cover_path: "covers/a.webp" })]} />,
    );

    const preview = container.querySelector(".project-preview");
    const image = container.querySelector(".project-preview img");

    expect(preview).toHaveAttribute("aria-hidden", "true");
    // Decorative duplicate of the row's own text, so it carries an empty alt.
    expect(image).toHaveAttribute("alt", "");
    expect(screen.getByRole("link", { name: "A" })).toBeInTheDocument();
  });

  it("shows every project, with no cap", () => {
    const many = Array.from({ length: 12 }, (_, index) => ({
      ...make({ id: `p${index}`, slug: `p${index}`, title: `Project ${index}` }),
    }));

    const { container } = render(<ProjectsList projects={many} />);

    expect(container.querySelectorAll("ol > li")).toHaveLength(12);
    expect(screen.getAllByText("Project 11").length).toBeGreaterThan(0);
  });

  it("shows a placeholder instead of an empty list", () => {
    const { container } = render(<ProjectsList projects={[]} />);

    expect(screen.getByText("Projects are being added.")).toBeInTheDocument();
    expect(container.querySelector("ol")).toBeNull();
  });
});

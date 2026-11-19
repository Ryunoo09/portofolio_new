import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectDetail } from "@/features/projects";
import type { ProjectWithMedia } from "@/types/content";

function make(overrides: Partial<ProjectWithMedia> = {}): ProjectWithMedia {
  return {
    id: "p1",
    slug: "alpha",
    title: "Alpha",
    summary: "A short summary.",
    description_md:
      "Intro paragraph.\n\n## Problem\n\nSomething broke.\n\n## Role\n\nI owned it.\n\n## Result\n\nIt worked.",
    role: "Backend",
    year: 2025,
    tech: ["One", "Two", "Three", "Four", "Five", "Six"],
    repo_url: null,
    live_url: null,
    is_private: false,
    cover_path: null,
    is_published: true,
    sort_order: 1,
    media: [],
    ...overrides,
  };
}

describe("ProjectDetail", () => {
  it("leads with the title as the only h1, plus summary and meta", () => {
    render(<ProjectDetail project={make()} />);

    const headings = screen.getAllByRole("heading", { level: 1 });

    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Alpha");
    expect(screen.getByText("A short summary.")).toBeVisible();
    expect(screen.getByText("2025 · Backend")).toBeVisible();
    expect(screen.getByRole("link", { name: "← All projects" })).toHaveAttribute(
      "href",
      "/#projects",
    );
  });

  it("renders the case study sections from Markdown as real headings", () => {
    render(<ProjectDetail project={make()} />);

    for (const name of ["Problem", "Role", "Result"]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeVisible();
    }

    expect(screen.getByText("Something broke.")).toBeVisible();
    expect(document.body.textContent).not.toContain("##");
  });

  it("shows the full stack, not the five-tag list cap", () => {
    render(<ProjectDetail project={make()} />);

    const stack = screen.getByRole("heading", { level: 2, name: "Stack" }).nextElementSibling;

    expect(stack?.querySelectorAll("li")).toHaveLength(6);
    expect(screen.getByText("Six")).toBeVisible();
  });

  it("labels a project without a public link as Private build", () => {
    const { rerender } = render(<ProjectDetail project={make()} />);

    expect(screen.getByText("Private build")).toBeVisible();

    rerender(<ProjectDetail project={make({ live_url: "https://alpha.example.com" })} />);

    expect(screen.queryByText("Private build")).toBeNull();
  });

  it("does not label a project just because is_private is set", () => {
    render(
      <ProjectDetail
        project={make({ is_private: true, repo_url: "https://github.com/example/alpha" })}
      />,
    );

    expect(screen.queryByText("Private build")).toBeNull();
    expect(screen.getByRole("link", { name: "Repository" })).toBeVisible();
  });

  it("gives a screenshot with an empty alt a useful description", () => {
    const { container } = render(
      <ProjectDetail
        project={make({
          media: [
            { id: "m1", project_id: "p1", path: "media/alpha/one.webp", alt: " ", sort_order: 1 },
          ],
        })}
      />,
    );

    expect(container.querySelector("img")).toHaveAttribute("alt", "Alpha screenshot");
  });

  it("renders the cover and gallery images with their alt text", () => {
    const { container } = render(
      <ProjectDetail
        project={make({
          cover_path: "covers/alpha.webp",
          media: [
            { id: "m1", project_id: "p1", path: "media/alpha/one.webp", alt: "Architecture diagram", sort_order: 1 },
            { id: "m2", project_id: "p1", path: "media/alpha/two.webp", alt: "Dashboard screenshot", sort_order: 2 },
          ],
        })}
      />,
    );

    const images = [...container.querySelectorAll("img")];

    expect(images).toHaveLength(3);
    expect(images.map((image) => image.getAttribute("alt"))).toEqual([
      "Alpha cover image",
      "Architecture diagram",
      "Dashboard screenshot",
    ]);
    // First image is the LCP candidate; the gallery stays lazy.
    expect(images[0]).toHaveAttribute("loading", "eager");
    expect(images[2]).toHaveAttribute("loading", "lazy");
  });

  it("renders no gallery when the project has no images", () => {
    const { container } = render(<ProjectDetail project={make()} />);

    expect(container.querySelector("img")).toBeNull();
  });

  it("links to the repository and live site, opening them safely", () => {
    render(
      <ProjectDetail
        project={make({
          repo_url: "https://github.com/example/alpha",
          live_url: "https://alpha.example.com",
        })}
      />,
    );

    for (const name of ["Repository", "Live site"]) {
      const link = screen.getByRole("link", { name });

      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer noopener");
    }
  });

  it("refuses a non-http link instead of rendering it", () => {
    render(<ProjectDetail project={make({ repo_url: "javascript:alert(1)" })} />);

    expect(screen.queryByRole("link", { name: "Repository" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Links" })).toBeNull();
  });
});

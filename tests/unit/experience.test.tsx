import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExperienceTimeline } from "@/features/experience";
import type { Experience } from "@/types/content";

function make(overrides: Partial<Experience> & Pick<Experience, "id" | "start_date">): Experience {
  return {
    role: "Software Engineer",
    organization: "Company",
    location: null,
    end_date: null,
    bullets: ["Shipped a thing."],
    tech: ["TypeScript"],
    sort_order: 1,
    ...overrides,
  };
}

describe("ExperienceTimeline", () => {
  it("renders entries in the order the data layer supplies", () => {
    const experiences = [
      make({ id: "a", start_date: "2024-01-01", role: "Newest" }),
      make({ id: "b", start_date: "2023-01-01", role: "Middle" }),
      make({ id: "c", start_date: "2020-01-01", role: "Oldest" }),
    ];

    const { container } = render(<ExperienceTimeline experiences={experiences} />);
    const roles = [...container.querySelectorAll("li h3")].map((node) => node.textContent);

    expect(roles).toEqual(["Newest", "Middle", "Oldest"]);
  });

  it("shows role, organisation, date range, bullets, and tech", () => {
    const { container } = render(
      <ExperienceTimeline
        experiences={[
          make({
            id: "a",
            start_date: "2024-01-01",
            role: "Backend Engineer",
            organization: "Acme",
            bullets: ["Cut latency by 40%."],
            tech: ["Go", "Postgres"],
          }),
        ]}
      />,
    );

    expect(screen.getByRole("heading", { level: 3, name: "Backend Engineer" })).toBeVisible();
    expect(screen.getByText("Acme")).toBeVisible();
    // The range is split across <time> elements, so read the rendered text.
    expect(container.textContent).toContain("Jan 2024 – Present");
    expect(screen.getByText("Cut latency by 40%.")).toBeVisible();
    expect(screen.getByText("Go")).toBeVisible();
    expect(screen.getByText("Postgres")).toBeVisible();
  });

  it("exposes machine-readable dates and omits datetime for an ongoing role", () => {
    const { container } = render(
      <ExperienceTimeline experiences={[make({ id: "a", start_date: "2024-01-01" })]} />,
    );

    const times = [...container.querySelectorAll("time")];

    expect(times).toHaveLength(1);
    expect(times[0]).toHaveAttribute("datetime", "2024-01-01");
    // "Present" is not a date, so it is plain text rather than an empty <time>.
    expect(times[0].textContent).toBe("Jan 2024");
    expect(container.textContent).toContain("Present");
  });

  it("uses both dates for a finished role", () => {
    const { container } = render(
      <ExperienceTimeline
        experiences={[make({ id: "a", start_date: "2022-03-01", end_date: "2023-08-01" })]}
      />,
    );

    const times = [...container.querySelectorAll("time")].map((node) =>
      node.getAttribute("datetime"),
    );

    expect(times).toEqual(["2022-03-01", "2023-08-01"]);
    expect(container.textContent).toContain("Mar 2022 – Aug 2023");
  });

  it("lists each entry as a list item so the total count is announced", () => {
    const { container } = render(
      <ExperienceTimeline
        experiences={[
          make({ id: "a", start_date: "2024-01-01" }),
          make({ id: "b", start_date: "2023-01-01" }),
        ]}
      />,
    );

    const list = container.querySelector("ol");

    expect(list).not.toBeNull();
    expect(list!.children).toHaveLength(2);
  });

  it("shows a placeholder instead of an empty list", () => {
    const { container } = render(<ExperienceTimeline experiences={[]} />);

    expect(screen.getByText("Experience is being updated.")).toBeInTheDocument();
    expect(container.querySelector("ol")).toBeNull();
  });

  it("survives a row with null bullets and tech instead of crashing", () => {
    const broken = {
      ...make({ id: "a", start_date: "2024-01-01", role: "Engineer" }),
      bullets: null,
      tech: null,
    } as unknown as Experience;

    render(<ExperienceTimeline experiences={[broken]} />);

    expect(screen.getByRole("heading", { level: 3, name: "Engineer" })).toBeVisible();
  });

  it("labels the tech list so it is distinguishable from the highlights", () => {
    render(
      <ExperienceTimeline
        experiences={[make({ id: "a", start_date: "2024-01-01", role: "Engineer", tech: ["Go"] })]}
      />,
    );

    expect(screen.getByRole("list", { name: "Technologies for Engineer" })).toBeVisible();
  });
});

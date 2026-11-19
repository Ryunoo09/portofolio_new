import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CvDownloadMenu } from "@/components/cv-download-menu";

const cv = { en: "/cv/en.pdf", id: "/cv/id.pdf" };

describe("CvDownloadMenu", () => {
  it("offers both languages from a closed menu, with no default", () => {
    const { container } = render(<CvDownloadMenu cv={cv} />);

    expect(container.querySelector("details")).not.toHaveAttribute("open");
    expect(screen.getByText("Download CV")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download CV in English" })).toHaveAttribute(
      "href",
      "/cv/en.pdf",
    );
    expect(screen.getByRole("link", { name: "Download CV in Indonesian" })).toHaveAttribute(
      "href",
      "/cv/id.pdf",
    );
  });

  it("keeps the accent button styling by default", () => {
    render(<CvDownloadMenu cv={cv} />);

    expect(screen.getByText("Download CV").className).toContain("bg-accent");
  });

  it("drops the button styling for the plain mobile-menu row", () => {
    render(<CvDownloadMenu cv={cv} variant="plain" className="py-2" />);

    const summary = screen.getByText("Download CV");

    expect(summary.className).not.toContain("bg-accent");
    expect(summary.className).toContain("py-2");
  });

  it("renders nothing when neither file is configured", () => {
    const { container } = render(<CvDownloadMenu cv={{ en: null, id: null }} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("closes the mobile menu when a language is chosen", () => {
    const onClick = vi.fn();
    render(<CvDownloadMenu cv={cv} variant="plain" onClick={onClick} />);

    fireEvent.click(screen.getByRole("link", { name: "Download CV in English" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
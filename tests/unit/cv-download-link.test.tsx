import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CvDownloadLink } from "@/components/cv-download-link";
import { CV_DOWNLOAD_HREF, CV_FILE_NAME } from "@/lib/cv";
import { CV_LABEL } from "@/lib/seo";

describe("CvDownloadLink", () => {
  it("downloads the CV file rather than opening a route", () => {
    render(<CvDownloadLink />);

    const link = screen.getByRole("link", { name: CV_LABEL });

    expect(link).toHaveAttribute("href", CV_DOWNLOAD_HREF);
    expect(link).toHaveAttribute("download", CV_FILE_NAME);
  });

  it("keeps the accent button styling by default", () => {
    render(<CvDownloadLink />);

    expect(screen.getByRole("link", { name: CV_LABEL }).className).toContain("bg-accent");
  });

  it("drops the button styling for the plain mobile-menu row", () => {
    render(<CvDownloadLink variant="plain" className="block py-2" />);

    const link = screen.getByRole("link", { name: CV_LABEL });

    expect(link.className).not.toContain("bg-accent");
    expect(link.className).toContain("block");
  });

  it("runs the click handler used to close the mobile menu", () => {
    const onClick = vi.fn();
    render(<CvDownloadLink variant="plain" onClick={onClick} />);

    fireEvent.click(screen.getByRole("link", { name: CV_LABEL }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

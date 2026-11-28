import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectGallery } from "@/features/projects/components/project-gallery";

const images = [
  { id: "m1", src: "https://example.test/dashboard.webp", alt: "Dashboard" },
  { id: "m2", src: "https://example.test/report.webp", alt: "Report" },
];

describe("ProjectGallery", () => {
  beforeEach(() => {
    // jsdom has no modal dialog implementation.
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.open = true;
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event("close"));
    });
  });

  it("renders nothing without media", () => {
    const { container } = render(<ProjectGallery images={[]} title="Alpha" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("opens a screenshot in a modal and closes it", () => {
    render(<ProjectGallery images={images} title="Alpha" />);

    expect(screen.getByAltText("Dashboard")).toBeInTheDocument();
    expect(screen.getByAltText("Report")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Open image: Dashboard"));

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    expect(screen.getAllByAltText("Dashboard")).toHaveLength(2);

    fireEvent.click(screen.getByLabelText("Close image"));

    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
    expect(screen.getAllByAltText("Dashboard")).toHaveLength(1);
  });
});
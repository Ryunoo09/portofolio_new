import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Certificates } from "@/features/certificates";
import type { Certificate } from "@/types/content";

const certificates: Certificate[] = [
  {
    id: "python",
    title: "Python Foundations",
    issuer: "Dicoding Academy",
    year: 2025,
    summary: "Python programming fundamentals.",
    image_path: null,
    verification_url: "https://example.com/verify",
    sort_order: 1,
  },
];

describe("Certificates", () => {
  it("renders certificate details, placeholder, and safe verification link", () => {
    render(<Certificates certificates={certificates} />);

    expect(screen.getByRole("heading", { name: "Certificates" })).toBeInTheDocument();
    expect(screen.getByText("Python Foundations")).toBeInTheDocument();
    expect(screen.getByText("Dicoding Academy · 2025")).toBeInTheDocument();
    expect(screen.getByText("Python programming fundamentals.")).toBeInTheDocument();
    expect(screen.getByText("Certificate image unavailable")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Verify certificate" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  });
});

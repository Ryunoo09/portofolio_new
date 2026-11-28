import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, buttonVariants } from "@/components/ui/button";

describe("Shadcn Button", () => {
  it("renders standard button element with default styles", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
    expect(button.tagName.toLowerCase()).toBe("button");
  });

  it("renders asChild element when asChild is true", () => {
    render(
      <Button asChild variant="secondary">
        <a href="/test-link">Anchor Link</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Anchor Link" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test-link");
    expect(link.tagName.toLowerCase()).toBe("a");
  });

  it("applies variant classes via buttonVariants", () => {
    const primaryClass = buttonVariants({ variant: "default" });
    expect(primaryClass).toContain("bg-accent");

    const secondaryClass = buttonVariants({ variant: "secondary" });
    expect(secondaryClass).toContain("border");

    const ghostClass = buttonVariants({ variant: "ghost" });
    expect(ghostClass).toContain("hover:text-fg");
  });

  it("supports disabled state", () => {
    render(<Button disabled>Disabled Action</Button>);
    const button = screen.getByRole("button", { name: "Disabled Action" });
    expect(button).toBeDisabled();
    expect(button.className).toContain("disabled:opacity-50");
  });
});

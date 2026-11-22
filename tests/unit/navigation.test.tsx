import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MobileMenu } from "@/features/navigation";
import { NAV_SECTIONS } from "@/lib/sections";

const cv = { en: "/cv/en.pdf", id: "/cv/id.pdf" };

// jsdom has no matchMedia; components that read it get this stub.
const mediaQueries = new Map<string, MediaQueryList>();

function installMatchMedia() {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => makeQuery(query),
  });
}

function makeQuery(query: string): MediaQueryList {
  const listeners = new Map<string, Set<(event: MediaQueryListEvent) => void>>();
  const mql = {
    matches: true,
    media: query,
    onchange: null,
    addEventListener: (type: string, handler: (event: MediaQueryListEvent) => void) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(handler);
    },
    removeEventListener: (type: string, handler: (event: MediaQueryListEvent) => void) => {
      listeners.get(type)?.delete(handler);
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: (event: Event) => {
      for (const handler of listeners.get(event.type) ?? []) {
        handler(event as MediaQueryListEvent);
      }
      return true;
    },
  } as unknown as MediaQueryList;

  mediaQueries.set(query, mql);
  return mql;
}

describe("MobileMenu", () => {
  it("shows every section icon and a menu trigger", () => {
    render(<MobileMenu cv={cv} />);

    const nav = screen.getByRole("navigation", { name: "Sections" });
    expect(nav.querySelectorAll("a")).toHaveLength(NAV_SECTIONS.length);
    expect(screen.getByRole("button", { name: "Menu" })).toBeInTheDocument();
  });

  it("includes a Certificates section link", () => {
    render(<MobileMenu cv={cv} />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));

    const link = document.querySelector('#mobile-menu a[href="#certificates"]');

    expect(link).toHaveAttribute("href", "#certificates");
  });

  it("scrolls to the selected section without changing the URL", () => {
    const scrollIntoView = vi.fn();
    const section = document.createElement("section");
    section.id = "certificates";
    section.scrollIntoView = scrollIntoView;
    document.body.append(section);
    render(<MobileMenu cv={cv} />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    const certificatesLink = document.querySelector('#mobile-menu a[href="#certificates"]');
    if (!certificatesLink) throw new Error("Certificates menu link missing");
    fireEvent.click(certificatesLink);

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(window.location.hash).toBe("");
    section.remove();
  });

  it("starts closed and exposes the trigger state", () => {
    render(<MobileMenu cv={cv} />);

    const trigger = screen.getByRole("button", { name: "Menu" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", "mobile-menu");
    expect(document.querySelector("#mobile-menu")).toHaveAttribute("hidden");
  });

  it("opens, focuses the first link, and closes on Escape returning focus", () => {
    render(<MobileMenu cv={cv} />);

    const trigger = screen.getByRole("button", { name: "Menu" });
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const firstLink = document.querySelector('#mobile-menu a[href="#home"]');
    expect(firstLink).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(document.querySelector("#mobile-menu")).toHaveAttribute("hidden");
    expect(trigger).toHaveFocus();
  });

  it("closes after a section link is chosen", () => {
    render(<MobileMenu cv={cv} />);

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    const projectsLink = document.querySelector('#mobile-menu a[href="#projects"]');
    if (!projectsLink) throw new Error("Projects menu link missing");
    fireEvent.click(projectsLink);

    expect(document.querySelector("#mobile-menu")).toHaveAttribute("hidden");
  });

  it("closes when the viewport is wide enough for the desktop nav", async () => {
    installMatchMedia();
    render(<MobileMenu cv={cv} />);

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    expect(document.querySelector("#mobile-menu")).not.toHaveAttribute("hidden");

    await act(async () => {
      window.dispatchEvent(new Event("resize"));
    });

    expect(document.querySelector("#mobile-menu")).toHaveAttribute("hidden");
  });
});

/** Single source for the in-page sections the navigation points at. */
export const NAV_SECTIONS = [
  { id: "home", label: "Home", icon: "home" },
  { id: "about", label: "About", icon: "user" },
  { id: "experience", label: "Experience", icon: "briefcase" },
  { id: "projects", label: "Projects", icon: "code" },
  { id: "certificates", label: "Certificates", icon: "award" },
  { id: "skills", label: "Skills", icon: "cpu" },
  { id: "contact", label: "Contact", icon: "mail" },
] as const;

export type SectionId = (typeof NAV_SECTIONS)[number]["id"];

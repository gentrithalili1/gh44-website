// One theme color per section, in theme order. The logo's "44" and the menu icons use it.
// Every page nested under a section takes its color. The next section gets blue (text-info).
// On home the "44" cycles through the menu colors (`logo-cycle` in styles.css), lavender as fallback.
export const SECTIONS = {
  home: { textClassName: "text-primary motion-safe:animate-logo-cycle", iconClassName: "" },
  // Pages outside every section, like the 404: static lavender.
  other: { textClassName: "text-primary", iconClassName: "" },
  work: {
    textClassName: "text-success",
    iconClassName: "group-hover:text-success group-data-[status=active]:text-success",
  },
  "gh44-brain": {
    textClassName: "text-primary",
    iconClassName: "group-hover:text-primary group-data-[status=active]:text-primary",
  },
  "gh44-theme": {
    textClassName: "text-warning",
    iconClassName: "group-hover:text-warning group-data-[status=active]:text-warning",
  },
} as const;

export type SectionId = keyof typeof SECTIONS;

const PAGE_SECTION_IDS = ["work", "gh44-brain", "gh44-theme"] as const satisfies SectionId[];

export function getSectionId(pathname: string): SectionId {
  if (pathname === "/") return "home";

  const firstSegment = pathname.split("/")[1];

  return PAGE_SECTION_IDS.find((sectionId) => sectionId === firstSegment) ?? "other";
}

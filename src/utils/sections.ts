export const SECTIONS = {
  home: { textClassName: "text-primary", iconClassName: "" },
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

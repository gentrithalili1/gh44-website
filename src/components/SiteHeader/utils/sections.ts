// One theme color per section, in theme order. The logo's "44" and the menu icons use it.
// Every page nested under a section takes its color. The next section gets rose (text-chart-5).
export const SECTIONS = {
  home: { textClassName: "text-primary", iconClassName: "" },
  work: {
    textClassName: "text-success",
    iconClassName: "group-hover:text-success group-data-[status=active]:text-success",
  },
  "gh44-brain": {
    textClassName: "text-info",
    iconClassName: "group-hover:text-info group-data-[status=active]:text-info",
  },
  "gh44-theme": {
    textClassName: "text-warning",
    iconClassName: "group-hover:text-warning group-data-[status=active]:text-warning",
  },
} as const;

export type SectionId = keyof typeof SECTIONS;

const PAGE_SECTION_IDS = ["work", "gh44-brain", "gh44-theme"] as const satisfies SectionId[];

export function getSectionId(pathname: string): SectionId {
  const firstSegment = pathname.split("/")[1];

  return PAGE_SECTION_IDS.find((sectionId) => sectionId === firstSegment) ?? "home";
}

import { BrainIcon, BriefcaseIcon, PaletteIcon, type LucideIcon } from "lucide-react";

import type { SectionId } from "../../../utils/sections";

type MenuItem = {
  sectionId: SectionId;
  label: string;
  to: "/work" | "/gh44-brain" | "/gh44-theme";
  Icon: LucideIcon;
};

export const MENU_ITEMS: MenuItem[] = [
  { sectionId: "work", label: "Work Experience", to: "/work", Icon: BriefcaseIcon },
  { sectionId: "gh44-brain", label: "gh44-brain", to: "/gh44-brain", Icon: BrainIcon },
  { sectionId: "gh44-theme", label: "gh44-theme", to: "/gh44-theme", Icon: PaletteIcon },
];

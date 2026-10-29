import { BrainIcon, BriefcaseIcon, type LucideIcon, PaletteIcon } from "lucide-react";

import type { FileRouteTypes } from "#/routeTree.gen";
import type { SectionId } from "#/utils/sections";

import { messages } from "../messages";

type MenuItem = {
  sectionId: SectionId;
  label: string;
  to: FileRouteTypes["to"];
  Icon: LucideIcon;
};

export const MENU_ITEMS: MenuItem[] = [
  { sectionId: "work", label: messages.workLabel, to: "/work", Icon: BriefcaseIcon },
  { sectionId: "gh44-brain", label: messages.gh44BrainLabel, to: "/gh44-brain", Icon: BrainIcon },
  { sectionId: "gh44-theme", label: messages.gh44ThemeLabel, to: "/gh44-theme", Icon: PaletteIcon },
];

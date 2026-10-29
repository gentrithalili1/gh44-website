import { Link } from "@tanstack/react-router";

import { cn } from "#/lib/utils";

import { SECTIONS, type SectionId } from "../../utils/sections";

interface SiteLogoProps {
  sectionId: SectionId;
}

export function SiteLogo({ sectionId }: SiteLogoProps) {
  return (
    <Link to="/" aria-label="gh44 home" className="font-mono text-4xl font-bold tracking-tight">
      gh
      <span className={cn("transition-colors", SECTIONS[sectionId].textClassName)}>44</span>
    </Link>
  );
}

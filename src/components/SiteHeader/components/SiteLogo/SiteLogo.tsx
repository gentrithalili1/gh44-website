import { Link } from "@tanstack/react-router";

import { cn } from "#/lib/utils";

import { SECTIONS, type SectionId } from "../../utils/sections";
import { messages } from "./messages";

interface SiteLogoProps {
  sectionId: SectionId;
}

export function SiteLogo({ sectionId }: SiteLogoProps) {
  return (
    <Link
      to="/"
      aria-label={messages.homeLabel}
      className="font-mono text-4xl font-bold tracking-tight"
    >
      {messages.wordmarkStart}
      <span className={cn("transition-colors", SECTIONS[sectionId].textClassName)}>
        {messages.wordmarkEnd}
      </span>
    </Link>
  );
}

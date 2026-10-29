import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";

import { SECTIONS, type SectionId } from "#/utils/sections";

interface SectionLinkProps extends ComponentProps<typeof Link> {
  sectionId: SectionId;
}

// A section name inside the statement, in its section's accent.
export function SectionLink({ sectionId, ...props }: SectionLinkProps) {
  return (
    <Link
      className={`rounded-sm whitespace-nowrap underline decoration-current/40 decoration-2 underline-offset-[0.2em] transition-[text-decoration-color] hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring ${SECTIONS[sectionId].textClassName}`}
      {...props}
    />
  );
}

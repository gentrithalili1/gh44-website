import { ArrowUpRightIcon } from "lucide-react";
import type { ComponentProps } from "react";

type ContactLinkProps = ComponentProps<"a">;

// An external profile link: mono and lowercase, with an arrow for the new tab.
export function ContactLink({ children, ...props }: ContactLinkProps) {
  return (
    <a
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-0.5 rounded-sm font-mono text-sm text-muted-foreground lowercase underline-offset-4 hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      {...props}
    >
      {children}
      <ArrowUpRightIcon aria-hidden className="size-3.5" />
    </a>
  );
}

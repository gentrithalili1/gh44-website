import type { ComponentProps } from "react";

type ContactLinkProps = ComponentProps<"a">;

// An external profile link: mono, lowercase and underlined.
export function ContactLink({ children, ...props }: ContactLinkProps) {
  return (
    <a
      target="_blank"
      rel="noreferrer"
      className="rounded-sm font-mono text-sm text-muted-foreground lowercase underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-current focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      {...props}
    >
      {children}
    </a>
  );
}

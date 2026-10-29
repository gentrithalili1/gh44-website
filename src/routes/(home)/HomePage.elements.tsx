import type { ComponentProps } from "react";

type ContactLinkProps = ComponentProps<"a">;

export function ContactLink({ children, ...props }: ContactLinkProps) {
  return (
    <a
      className="rounded-sm font-mono text-base text-muted-foreground lowercase underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-current focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      {...props}
    >
      {children}
    </a>
  );
}

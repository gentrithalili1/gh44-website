import type { ComponentProps } from "react";

interface ContactLinkProps extends ComponentProps<"a"> {
  isExternal: boolean;
}

export function ContactLink({ isExternal, ...props }: ContactLinkProps) {
  return (
    <a
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      className="rounded-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      {...props}
    />
  );
}

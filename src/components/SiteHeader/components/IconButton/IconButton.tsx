import type { ComponentProps } from "react";

import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";

interface IconButtonProps extends Omit<
  ComponentProps<typeof Button>,
  "variant" | "size" | "aria-label"
> {
  label: string;
}

// One size for every icon button: pass the icon as children, the button sizes it.
export function IconButton({ label, className, ...props }: IconButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon-lg"
      aria-label={label}
      className={cn("[&_svg:not([class*='size-'])]:size-6", className)}
      {...props}
    />
  );
}

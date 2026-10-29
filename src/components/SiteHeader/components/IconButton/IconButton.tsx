import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "#/components/ui/button";

interface IconButtonProps extends Omit<
  ComponentProps<typeof Button>,
  "size" | "children" | "aria-label"
> {
  icon: LucideIcon;
  label: string;
}

// shadcn's Button with one fixed size, so every icon button matches.
export function IconButton({ icon: Icon, label, variant = "ghost", ...props }: IconButtonProps) {
  return (
    <Button variant={variant} size="icon-lg" aria-label={label} {...props}>
      <Icon aria-hidden className="size-6" />
    </Button>
  );
}

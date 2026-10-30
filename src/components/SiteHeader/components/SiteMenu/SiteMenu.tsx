import { Link, useRouterState } from "@tanstack/react-router";
import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "#/components/ui/sheet";
import { cn } from "#/lib/utils";
import { SECTIONS } from "#/utils/sections";
import { getViewTransition, VIEW_TRANSITION_TYPES } from "#/utils/viewTransition";

import { IconButton } from "../IconButton";
import { messages } from "./messages";
import { MENU_ITEMS } from "./utils/menuItems";

const MENU_VIEW_TRANSITION = getViewTransition(VIEW_TRANSITION_TYPES.menu);

export function SiteMenu() {
  const pathname = useRouterState({ select: (state) => state.resolvedLocation?.pathname ?? null });

  const [openedPathname, setOpenedPathname] = useState<string | null>(null);

  const isOpen = openedPathname === pathname;

  const handleOpenChange = (open: boolean) => setOpenedPathname(open ? pathname : null);

  const handleItemClick = (to: string) => {
    if (to === pathname) setOpenedPathname(null);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger render={<IconButton icon={MenuIcon} label={messages.openMenuLabel} />} />
      <SheetContent side="right" showCloseButton={false}>
        <SheetClose
          render={
            <IconButton
              icon={XIcon}
              label={messages.closeMenuLabel}
              className="absolute top-6 right-6"
            />
          }
        />
        <SheetTitle className="sr-only">{messages.title}</SheetTitle>
        <nav aria-label={messages.navLabel} className="px-6 pt-20">
          <ul className="grid gap-1">
            {MENU_ITEMS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  viewTransition={MENU_VIEW_TRANSITION}
                  onClick={() => handleItemClick(item.to)}
                  className="group -mx-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-lg font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:bg-muted data-[status=active]:text-foreground"
                >
                  <item.Icon
                    aria-hidden
                    className={cn(
                      "size-5 transition-colors",
                      SECTIONS[item.sectionId].iconClassName,
                    )}
                  />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

import { Link } from "@tanstack/react-router";
import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "#/components/ui/sheet";
import { cn } from "#/lib/utils";

import { SECTIONS } from "../../utils/sections";
import { IconButton } from "../IconButton";
import { messages } from "./messages";
import { MENU_ITEMS } from "./utils/menuItems";

export function SiteMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger render={<IconButton label={messages.openMenuLabel} />}>
        <MenuIcon aria-hidden />
      </SheetTrigger>
      <SheetContent showCloseButton={false}>
        <SheetClose
          render={<IconButton label={messages.closeMenuLabel} className="absolute top-6 right-6" />}
        >
          <XIcon aria-hidden />
        </SheetClose>
        <SheetTitle className="sr-only">{messages.title}</SheetTitle>
        <nav aria-label={messages.navLabel} className="px-6 pt-16">
          <ul className="grid gap-1">
            {MENU_ITEMS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={handleNavigate}
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

import { useLocation } from "@tanstack/react-router";

import { getSectionId } from "#/utils/sections";

import { SiteLogo } from "./components/SiteLogo";
import { SiteMenu } from "./components/SiteMenu";
import { ThemeToggle } from "./components/ThemeToggle";

export function SiteHeader() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const sectionId = getSectionId(pathname);

  return (
    <header className="flex items-center justify-between py-6">
      <SiteLogo sectionId={sectionId} />
      <div className="-mr-1.5 flex items-center gap-1">
        <ThemeToggle />
        <SiteMenu />
      </div>
    </header>
  );
}

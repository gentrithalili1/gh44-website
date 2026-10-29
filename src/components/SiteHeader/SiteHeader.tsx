import { useLocation } from "@tanstack/react-router";

import { getSectionId } from "#/utils/sections";

import { SiteLogo } from "./components/SiteLogo";
import { SiteMenu } from "./components/SiteMenu";
import { ThemeToggle } from "./components/ThemeToggle";

export function SiteHeader() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const sectionId = getSectionId(pathname);

  return (
    <header className="flex items-center justify-between py-6 [view-transition-name:site-header]">
      <SiteLogo sectionId={sectionId} />
      {/* The icon buttons have inner padding; pull them out so the icons sit flush with the page edge. */}
      <div className="-mr-1.5 flex items-center gap-1">
        <ThemeToggle />
        <SiteMenu />
      </div>
    </header>
  );
}

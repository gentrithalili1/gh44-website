import { useLocation } from "@tanstack/react-router";

import { SiteLogo } from "./components/SiteLogo";
import { SiteMenu } from "./components/SiteMenu";
import { ThemeToggle } from "./components/ThemeToggle";
import { getSectionId } from "./utils/sections";

export function SiteHeader() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const sectionId = getSectionId(pathname);

  return (
    <header className="flex items-center justify-between py-6">
      <SiteLogo sectionId={sectionId} />
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <SiteMenu />
      </div>
    </header>
  );
}

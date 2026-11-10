import { useLocation } from "@tanstack/react-router";

import { PANEL_STYLE } from "#/utils/panel";

import { BackToOrbitLink } from "../BackToOrbitLink";
import { messages } from "./messages";
import { LostPlanet } from "./NotFound.elements";

const PLUTO_PATH = "/pluto";

// Any page that is not a planet: a lost one, with dinosaurs, and the way back. Pluto, found far
// out in the system, gets its own verdict.
export function NotFound() {
  const location = useLocation();
  const copy = location.pathname === PLUTO_PATH ? messages.pluto : messages;

  return (
    <>
      <BackToOrbitLink />
      <main
        style={PANEL_STYLE}
        className="fixed inset-x-0 bottom-0 z-20 h-(--sheet-height) overflow-y-auto border-t border-rule bg-background px-5 py-8 md:inset-y-0 md:right-0 md:left-auto md:h-auto md:w-[min(var(--panel-width),100%)] md:border-t-0 md:border-l md:px-12 md:pt-24 md:pb-12"
      >
        <LostPlanet label={messages.illustration} />
        <h1 className="mb-1.5 text-planet-sm font-bold tracking-planet md:text-planet">
          {copy.heading}
        </h1>
        <p className="max-w-[36ch] text-lede text-muted">{copy.description}</p>
      </main>
    </>
  );
}

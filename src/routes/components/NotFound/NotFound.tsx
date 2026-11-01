import { Link } from "@tanstack/react-router";

import { PANEL_STYLE } from "#/utils/panel";

import { messages } from "./messages";
import { LostPlanet } from "./NotFound.elements";

// Any page that is not a planet: a lost one, with dinosaurs, and the way back.
export function NotFound() {
  return (
    <main
      style={PANEL_STYLE}
      className="fixed inset-x-0 bottom-0 z-20 h-(--sheet-height) overflow-y-auto border-t border-rule bg-background px-5 py-8 md:inset-y-0 md:right-0 md:left-auto md:h-auto md:w-[min(var(--panel-width),100%)] md:border-t-0 md:border-l md:px-12 md:pt-24 md:pb-12"
    >
      <LostPlanet label={messages.illustration} />
      <h1 className="mb-1.5 text-planet-sm font-bold tracking-planet md:text-planet">
        {messages.heading}
      </h1>
      <p className="mb-8 max-w-[36ch] text-lede text-muted">{messages.description}</p>
      <Link
        to="/"
        className="text-label text-muted underline decoration-rule underline-offset-4 transition-colors hover:text-foreground hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-muted"
      >
        <span aria-hidden="true">{messages.backArrow}</span> {messages.backToOrbit}
      </Link>
    </main>
  );
}

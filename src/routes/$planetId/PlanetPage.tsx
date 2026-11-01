import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { PANEL_STYLE } from "#/utils/panel";
import type { Planet, PlanetId } from "#/utils/planets";

import { BrainPanel } from "./components/BrainPanel";
import { ConfirmPanel } from "./components/ConfirmPanel";
import { MePanel } from "./components/MePanel";
import { ThemePanel } from "./components/ThemePanel";
import { WorkPanel } from "./components/WorkPanel";
import { messages } from "./messages";
import type { HighlightedCode } from "./types";

const routeApi = getRouteApi("/$planetId");

export function PlanetPage() {
  const loaderData = routeApi.useLoaderData();
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // A dialog that handles Esc itself prevents the default.
      if (event.key === "Escape" && !event.defaultPrevented) void navigate({ to: "/" });
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const { planet } = loaderData;

  return (
    <>
      {/* Beside the music button when the root layout shows one, vertically centered on it. */}
      <Link
        to="/"
        className="fixed top-4 left-4 z-30 text-label text-muted transition-colors group-has-[[data-music-button]]/root:top-7 group-has-[[data-music-button]]/root:left-24 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-muted md:top-8 md:left-10 md:group-has-[[data-music-button]]/root:top-11 md:group-has-[[data-music-button]]/root:left-30"
      >
        <span aria-hidden="true">{messages.backArrow}</span> {messages.backToOrbit}
      </Link>
      <main
        style={PANEL_STYLE}
        className="fixed inset-x-0 bottom-0 z-20 h-(--sheet-height) overflow-y-auto border-t border-rule bg-background px-5 py-8 md:inset-y-0 md:right-0 md:left-auto md:h-auto md:w-[min(var(--panel-width),100%)] md:border-t-0 md:bg-transparent md:px-12 md:pt-24 md:pb-12"
      >
        <p className="text-kicker tracking-kicker text-accent">
          {messages.kicker} · {getKicker(planet)}
        </p>
        <h1 className="mt-2 mb-1.5 text-planet-sm font-bold tracking-planet text-accent md:text-planet">
          {planet.title}
        </h1>
        <p className="mb-8 max-w-[36ch] text-lede text-muted">{planet.lede}</p>
        {getPanel({ planetId: planet.id, code: loaderData.code })}
      </main>
    </>
  );
}

// The kicker names the planet when the heading says something else.
function getKicker(planet: Planet) {
  return planet.title === planet.name ? planet.sub : planet.name;
}

type GetPanelParams = { planetId: PlanetId; code: HighlightedCode };

// A new planet without a panel breaks the build here.
function getPanel({ planetId, code }: GetPanelParams) {
  switch (planetId) {
    case "me":
      return <MePanel />;
    case "work":
      return <WorkPanel />;
    case "gh44-brain":
      return <BrainPanel code={code} />;
    case "gh44-theme":
      return <ThemePanel code={code} />;
    case "confirm":
      return <ConfirmPanel code={code} />;
    default: {
      const unknownPlanet: never = planetId;
      return unknownPlanet;
    }
  }
}

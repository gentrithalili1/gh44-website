import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { PANEL_STYLE } from "#/utils/panel";
import type { Planet, PlanetId } from "#/utils/planets";

import { MePanel } from "./components/MePanel";
import { ProjectPanel } from "./components/ProjectPanel";
import { WorkPanel } from "./components/WorkPanel";
import { messages } from "./messages";

const routeApi = getRouteApi("/$planetId");

export function PlanetPage() {
  const planet = routeApi.useLoaderData();
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") void navigate({ to: "/" });
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <>
      <Link
        to="/"
        className="fixed top-4 left-4 z-30 text-label text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-muted md:top-8 md:left-10"
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
        {getPanel(planet.id)}
      </main>
    </>
  );
}

// The kicker names the planet when the heading says something else.
function getKicker(planet: Planet) {
  return planet.title === planet.name ? planet.sub : planet.name;
}

// A new planet without a panel breaks the build here.
function getPanel(planetId: PlanetId) {
  switch (planetId) {
    case "me":
      return <MePanel />;
    case "work":
      return <WorkPanel />;
    case "gh44-brain":
    case "gh44-theme":
    case "confirm":
      return <ProjectPanel projectId={planetId} />;
    default: {
      const unknownPlanet: never = planetId;
      return unknownPlanet;
    }
  }
}

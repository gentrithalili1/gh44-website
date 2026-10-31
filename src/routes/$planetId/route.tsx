import { createFileRoute, notFound } from "@tanstack/react-router";

import { findPlanet } from "#/utils/planets";
import { seo } from "#/utils/seo";

import { PlanetPage } from "./PlanetPage";

export const Route = createFileRoute("/$planetId")({
  loader: ({ params }) => {
    const planet = findPlanet(params.planetId);
    if (!planet) throw notFound();

    return planet;
  },
  head: ({ loaderData }) =>
    loaderData
      ? seo({
          title: loaderData.seo.title,
          description: loaderData.seo.description,
          path: `/${loaderData.id}`,
        })
      : {},
  component: PlanetPage,
});

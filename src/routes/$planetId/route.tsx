import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { findPlanet } from "#/utils/planets";
import { seo } from "#/utils/seo";
import { isThemeToolId, type ThemeToolId } from "#/utils/themeTools";

import { PlanetPage } from "./PlanetPage";
import type { HighlightedCode } from "./types";
import { CODE_SNIPPETS, getPlanetSnippetIds } from "./utils/codeSnippets";
import { highlightCode } from "./utils/highlight";

// Runs on the server, also for client-side navigation, so Shiki never reaches the browser.
const getHighlightedCode = createServerFn()
  .validator((planetId: unknown) => {
    const planet = typeof planetId === "string" ? findPlanet(planetId) : undefined;
    if (!planet) throw new Error(`No planet "${String(planetId)}"`);

    return planet.id;
  })
  .handler(async ({ data: planetId }) => {
    const entries = await Promise.all(
      getPlanetSnippetIds(planetId).map(async (snippetId) => {
        const { code, lang } = CODE_SNIPPETS[snippetId];
        return [snippetId, await highlightCode({ code, lang })] as const;
      }),
    );

    return Object.fromEntries(entries) satisfies HighlightedCode;
  });

// `app` picks gh44-theme's install tab; an app it does not know falls back to the first.
type PlanetSearch = { app?: ThemeToolId };

export const Route = createFileRoute("/$planetId")({
  validateSearch: (search: Record<string, unknown>): PlanetSearch =>
    isThemeToolId(search.app) ? { app: search.app } : {},
  loader: async ({ params }) => {
    const planet = findPlanet(params.planetId);
    if (!planet) throw notFound();

    // Planets without code (me, work) skip the trip to the server.
    const code: HighlightedCode =
      getPlanetSnippetIds(planet.id).length > 0
        ? await getHighlightedCode({ data: planet.id })
        : {};

    return { planet, code };
  },
  head: ({ loaderData }) =>
    loaderData
      ? seo({
          title: loaderData.planet.seo.title,
          description: loaderData.planet.seo.description,
          path: `/${loaderData.planet.id}`,
        })
      : {},
  component: PlanetPage,
});

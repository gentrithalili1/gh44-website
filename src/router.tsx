import { createRouter as createTanStackRouter, type RouterHistory } from "@tanstack/react-router";

import { recordVisit } from "./hooks/useExploration";
import { routeTree } from "./routeTree.gen";
import { findPlanet } from "./utils/planets";

type GetRouterParams = {
  history?: RouterHistory;
};

export function getRouter({ history }: GetRouterParams = {}) {
  const router = createTanStackRouter({
    routeTree,
    history,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  // A planet's page on screen marks it visited: after the first render, which the server loaded,
  // and after every navigation. Preloads render nothing, so they never count.
  router.subscribe("onRendered", () => {
    const params = router.state.matches.at(-1)?.params;
    const planet = params && "planetId" in params ? findPlanet(params.planetId) : undefined;
    if (planet) recordVisit(planet.id);
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

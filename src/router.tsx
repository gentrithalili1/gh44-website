import { createRouter as createTanStackRouter, type RouterHistory } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

type GetRouterParams = {
  history?: RouterHistory;
};

export function getRouter({ history }: GetRouterParams = {}) {
  const router = createTanStackRouter({
    routeTree,
    history,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    // The page transition resets the scroll itself, between the old page and the new one.
    // Only a function can turn the router's scroll-to-top off: `false` still scrolls on push.
    scrollRestoration: () => false,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

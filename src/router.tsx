import { createRouter as createTanStackRouter, type RouterHistory } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
import { getViewTransition, VIEW_TRANSITION_TYPES } from "./utils/viewTransition";

type GetRouterParams = {
  history?: RouterHistory;
};

export function getRouter({ history }: GetRouterParams = {}) {
  const router = createTanStackRouter({
    routeTree,
    history,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultViewTransition: getViewTransition(VIEW_TRANSITION_TYPES.page),
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

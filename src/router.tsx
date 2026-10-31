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
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

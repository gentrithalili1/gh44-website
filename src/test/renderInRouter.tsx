import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { act, render } from "@testing-library/react";

// Renders one component on its own, inside a router at `path`, for components that read the
// route or render links.
export async function renderInRouter({ ui, path = "/" }: { ui: React.ReactNode; path?: string }) {
  const rootRoute = createRootRoute({ component: () => ui });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await act(() => router.load());

  return render(<RouterProvider router={router} />);
}

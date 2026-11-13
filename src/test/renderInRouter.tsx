import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { act, render } from "@testing-library/react";

export async function renderInRouter({ ui, path = "/" }: { ui: React.ReactNode; path?: string }) {
  const rootRoute = createRootRoute({ component: () => ui });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await act(() => router.load());

  return render(<RouterProvider router={router} />);
}

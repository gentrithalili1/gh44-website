import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { act, render } from "@testing-library/react";

import { routeTree } from "#/routeTree.gen";

export async function renderAt(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  await act(() => router.load());

  return render(<RouterProvider router={router} />, { container: document });
}

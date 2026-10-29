import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { act, render } from "@testing-library/react";

import { getRouter } from "#/router";

export async function renderAt(path: string) {
  const router = getRouter({ history: createMemoryHistory({ initialEntries: [path] }) });

  await act(() => router.load());

  return render(<RouterProvider router={router} />, { container: document });
}

import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Link, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { SiteHeader } from "#/components/SiteHeader";
import { Button } from "#/components/ui/button";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#1E1F22" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="mx-auto flex min-h-dvh flex-col px-6">
          <SiteHeader />
          <main className="flex-1 py-8">{children}</main>
        </div>
        {import.meta.env.DEV ? (
          <TanStackDevtools
            config={{ position: "bottom-right" }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        ) : null}
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <section className="grid justify-items-start gap-4">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-muted-foreground">This page does not exist.</p>
      <Button render={<Link to="/" />}>Back home</Button>
    </section>
  );
}

import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Link, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { PageHeader } from "#/components/PageHeader";
import { SiteHeader } from "#/components/SiteHeader";
import { Button } from "#/components/ui/button";

import appCss from "../styles.css?url";
import { messages } from "./messages";

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
        <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-6 md:px-10">
          <SiteHeader />
          <main className="flex flex-1 flex-col pb-16">{children}</main>
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
    <PageHeader variant="page" title={messages.notFoundHeading} lead={messages.notFoundDescription}>
      <Button render={<Link to="/" />}>{messages.notFoundBackHome}</Button>
    </PageHeader>
  );
}

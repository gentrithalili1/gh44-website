import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Link, ScriptOnce, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { PageWrapper } from "#/components/PageWrapper";
import { SiteHeader } from "#/components/SiteHeader";
import { Button } from "#/components/ui/button";
import { THEME_SCRIPT } from "#/utils/theme";

import appCss from "../styles.css?url";
import { messages } from "./messages";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: messages.siteTitle },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    // The theme script sets the `dark` class before hydration.
    <html lang="en" suppressHydrationWarning>
      <head>
        <ScriptOnce>{THEME_SCRIPT}</ScriptOnce>
        <HeadContent />
      </head>
      <body>
        <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 md:px-10">
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
    <PageWrapper>
      <h1 className="text-title font-bold">{messages.notFoundHeading}</h1>
      <p className="max-w-prose text-lead text-muted-foreground">{messages.notFoundDescription}</p>
      <Button render={<Link to="/" />}>{messages.notFoundBackHome}</Button>
    </PageWrapper>
  );
}

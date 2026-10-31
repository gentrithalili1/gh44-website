import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  ScriptOnce,
  Scripts,
  useParams,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { SolarSystem } from "#/components/SolarSystem";
import { findPlanet } from "#/utils/planets";
import { THEME_SCRIPT } from "#/utils/theme";

import appCss from "../styles.css?url";
import { messages } from "./messages";
import { getPlanetStyle } from "./utils/planetStyle";

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
  component: RootLayout,
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
        {children}
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

function RootLayout() {
  const params = useParams({ strict: false });

  const planet = findPlanet(params.planetId);

  return (
    <div
      data-planet={planet?.id}
      style={getPlanetStyle(planet)}
      className="fixed inset-0 bg-background transition-colors duration-900 ease-space"
    >
      <SolarSystem openPlanetId={planet?.id} />
      <Outlet />
    </div>
  );
}

function NotFound() {
  return (
    <main className="fixed inset-x-0 bottom-0 z-20 h-[62%] overflow-y-auto border-t border-rule bg-background px-5 py-8 md:inset-y-0 md:right-0 md:left-auto md:h-auto md:w-[min(35rem,100%)] md:border-t-0 md:border-l md:px-12 md:pt-24 md:pb-12">
      <h1 className="mb-1.5 text-planet-sm font-bold tracking-planet md:text-planet">
        {messages.notFoundHeading}
      </h1>
      <p className="text-lede text-muted">{messages.notFoundDescription}</p>
    </main>
  );
}

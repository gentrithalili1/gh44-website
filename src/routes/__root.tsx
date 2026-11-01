import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Outlet, Scripts, useParams } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { SolarSystem } from "#/components/SolarSystem";
import { SPACE_COLORS } from "#/utils/palette";
import { findPlanet } from "#/utils/planets";

import appCss from "../styles.css?url";
import { MusicButton } from "./components/MusicButton";
import { NotFound } from "./components/NotFound";
import { messages } from "./messages";
import { getPlanetStyle } from "./utils/planetStyle";

// Without JavaScript nothing types in or plays, so code and the session replay show whole.
const NO_SCRIPT_STYLE = "[data-hidden] { visibility: visible !important; }";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: SPACE_COLORS.background },
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
    <html lang="en">
      <head>
        <HeadContent />
        <noscript>
          <style>{NO_SCRIPT_STYLE}</style>
        </noscript>
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
      className="group/root fixed inset-0 bg-background transition-colors duration-900 ease-space"
    >
      <SolarSystem openPlanetId={planet?.id} />
      <Outlet />
      <MusicButton />
    </div>
  );
}

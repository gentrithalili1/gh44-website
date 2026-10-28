import { TanStackDevtools } from "@tanstack/react-devtools";
import { HeadContent, Link, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#1E1F22" },
    ],
    links: [
      {
        rel: "preload",
        href: "/fonts/JetBrainsMono.ttf",
        as: "font",
        type: "font/ttf",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
});

const NAV_LINKS = [
  { to: "/", label: "home" },
  { to: "/about", label: "about" },
] as const;

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6">
          <header className="flex items-center justify-between border-b border-border py-6">
            <Link to="/" className="font-bold text-brand">
              gh44
            </Link>
            <nav aria-label="Main">
              <ul className="flex gap-6 text-sm">
                {NAV_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-muted hover:text-text"
                      activeProps={{ className: "text-text" }}
                      activeOptions={{ exact: true }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </header>
          <main className="flex-1 py-16">{children}</main>
          <footer className="border-t border-border py-6 text-sm text-comment">
            // work in progress
          </footer>
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
    <section className="grid gap-4">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-muted">This page does not exist.</p>
      <Link to="/" className="text-brand hover:underline">
        Back home
      </Link>
    </section>
  );
}

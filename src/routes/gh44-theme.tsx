import { createFileRoute } from "@tanstack/react-router";

import { seo } from "#/utils/seo";

export const Route = createFileRoute("/gh44-theme")({
  head: () =>
    seo({
      title: "gh44-theme | gh44.dev",
      description: "gh44-theme: one color theme for every tool.",
      path: "/gh44-theme",
    }),
  component: Theme,
});

function Theme() {
  return (
    <section className="grid gap-6">
      <h1 className="text-4xl font-bold tracking-tight">gh44-theme</h1>
      <p className="text-muted-foreground">Coming soon.</p>
    </section>
  );
}

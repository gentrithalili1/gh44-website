import { createFileRoute } from "@tanstack/react-router";

import { seo } from "#/utils/seo";

export const Route = createFileRoute("/work")({
  head: () =>
    seo({
      title: "Work experience | gh44.dev",
      description: "Work experience of Gentrit Halili, senior frontend engineer.",
      path: "/work",
    }),
  component: Work,
});

function Work() {
  return (
    <section className="grid gap-6">
      <h1 className="text-4xl font-bold tracking-tight">Work experience</h1>
      <p className="text-muted-foreground">Coming soon.</p>
    </section>
  );
}

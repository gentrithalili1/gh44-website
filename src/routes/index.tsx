import { createFileRoute } from "@tanstack/react-router";

import { seo } from "#/utils/seo";

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: "gh44.dev",
      description: "Personal site of Gentrit Halili, frontend engineer. Work in progress.",
      path: "/",
    }),
  component: Home,
});

function Home() {
  return (
    <section className="grid gap-6">
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground">
        <span className="size-2 animate-pulse rounded-full bg-primary motion-reduce:animate-none" />
        Work in progress
      </span>
      <h1 className="text-5xl font-bold tracking-tight">gh44.dev</h1>
      <p className="text-muted-foreground">
        Something is being built here. Work experience, gh44-brain and gh44-theme are on the way.
      </p>
    </section>
  );
}

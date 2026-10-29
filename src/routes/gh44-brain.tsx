import { createFileRoute } from "@tanstack/react-router";

import { seo } from "#/utils/seo";

export const Route = createFileRoute("/gh44-brain")({
  head: () =>
    seo({
      title: "gh44-brain | gh44.dev",
      description: "gh44-brain: how Gentrit Halili works with AI agents in Claude Code.",
      path: "/gh44-brain",
    }),
  component: Brain,
});

function Brain() {
  return (
    <section className="grid gap-6">
      <h1 className="text-4xl font-bold tracking-tight">gh44-brain</h1>
      <p className="text-muted-foreground">Coming soon.</p>
    </section>
  );
}

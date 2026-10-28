import { createFileRoute } from "@tanstack/react-router";

import { seo } from "#/utils/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    seo({
      title: "About | gh44.dev",
      description: "Gentrit Halili is a senior frontend engineer working in React and TypeScript.",
      path: "/about",
    }),
  component: About,
});

function About() {
  return (
    <section className="grid gap-6">
      <h1 className="text-4xl font-bold tracking-tight">About</h1>
      <p className="text-muted">
        I'm Gentrit, a senior frontend engineer working mostly in React and TypeScript.
      </p>
      <ul className="grid gap-2 text-sm">
        <li>
          <span className="text-setup">gh44-brain</span>
          <span className="text-comment"> // how I work with AI agents</span>
        </li>
        <li>
          <span className="text-accent">gh44-theme</span>
          <span className="text-comment"> // one theme, every tool</span>
        </li>
      </ul>
    </section>
  );
}

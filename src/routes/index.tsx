import { createFileRoute } from "@tanstack/react-router";

import { seo } from "#/utils/seo";

import { messages } from "./messages";
import { PERSON_JSON_LD } from "./utils/personJsonLd";

export const Route = createFileRoute("/")({
  head: () => ({
    ...seo({
      title: messages.homeSeoTitle,
      description: messages.homeSeoDescription,
      path: "/",
    }),
    scripts: [{ type: "application/ld+json", children: JSON.stringify(PERSON_JSON_LD) }],
  }),
  component: HomePage,
});

// The system itself is the page; the heading names it for search engines and screen readers.
function HomePage() {
  return (
    <main>
      <h1 className="sr-only">{messages.homeHeading}</h1>
    </main>
  );
}

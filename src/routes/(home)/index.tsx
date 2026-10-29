import { createFileRoute } from "@tanstack/react-router";

import { seo } from "#/utils/seo";

import { HomePage } from "./HomePage";
import { messages } from "./messages";
import { PERSON_JSON_LD } from "./utils/personJsonLd";

export const Route = createFileRoute("/(home)/")({
  head: () => ({
    ...seo({
      title: messages.seoTitle,
      description: messages.seoDescription,
      path: "/",
    }),
    scripts: [{ type: "application/ld+json", children: JSON.stringify(PERSON_JSON_LD) }],
  }),
  component: HomePage,
});

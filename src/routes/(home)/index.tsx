import { createFileRoute } from "@tanstack/react-router";

import { seo } from "#/utils/seo";

import { HomePage } from "./HomePage";
import { messages } from "./messages";

export const Route = createFileRoute("/(home)/")({
  head: () =>
    seo({
      title: messages.seoTitle,
      description: messages.seoDescription,
      path: "/",
    }),
  component: HomePage,
});

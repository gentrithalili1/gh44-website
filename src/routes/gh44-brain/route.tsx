import { createFileRoute } from "@tanstack/react-router";

import { seo } from "#/utils/seo";

import { Gh44BrainPage } from "./Gh44BrainPage";
import { messages } from "./messages";

export const Route = createFileRoute("/gh44-brain")({
  head: () =>
    seo({
      title: messages.seoTitle,
      description: messages.seoDescription,
      path: "/gh44-brain",
    }),
  component: Gh44BrainPage,
});

import { createFileRoute } from "@tanstack/react-router";

import { seo } from "#/utils/seo";

import { messages } from "./messages";
import { WorkPage } from "./WorkPage";

export const Route = createFileRoute("/work")({
  head: () =>
    seo({
      title: messages.seoTitle,
      description: messages.seoDescription,
      path: "/work",
    }),
  component: WorkPage,
});

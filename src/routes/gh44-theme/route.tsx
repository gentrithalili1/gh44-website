import { createFileRoute } from "@tanstack/react-router";

import { seo } from "#/utils/seo";

import { Gh44ThemePage } from "./Gh44ThemePage";
import { messages } from "./messages";

export const Route = createFileRoute("/gh44-theme")({
  head: () =>
    seo({
      title: messages.seoTitle,
      description: messages.seoDescription,
      path: "/gh44-theme",
    }),
  component: Gh44ThemePage,
});

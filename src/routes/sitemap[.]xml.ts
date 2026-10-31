import { createFileRoute } from "@tanstack/react-router";

import { getSitemapXml } from "./utils/sitemapXml";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => new Response(getSitemapXml(), { headers: { "Content-Type": "application/xml" } }),
    },
  },
});

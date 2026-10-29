import { createFileRoute } from "@tanstack/react-router";

import { SITE_URL } from "#/utils/seo";

// Add every public page here so search engines find it.
const SITEMAP_PATHS = ["/", "/work", "/gh44-brain", "/gh44-theme"] as const;

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const urls = SITEMAP_PATHS.map((path) => `  <url><loc>${SITE_URL}${path}</loc></url>`);
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...urls,
          "</urlset>",
        ].join("\n");

        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});

import { PLANETS } from "#/utils/planets";
import { SITE_URL } from "#/utils/seo";

// Home plus every planet page, so search engines find each one.
export function getSitemapXml() {
  const paths = ["/", ...PLANETS.map((planet) => `/${planet.id}`)];
  const urls = paths.map((path) => `  <url><loc>${SITE_URL}${path}</loc></url>`);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
  ].join("\n");
}

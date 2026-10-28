export const SITE_URL = "https://gh44.dev";
export const SITE_NAME = "gh44.dev";

type SeoParams = {
  title: string;
  description: string;
  path: string;
};

export function seo({ title, description, path }: SeoParams) {
  const url = `${SITE_URL}${path}`;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

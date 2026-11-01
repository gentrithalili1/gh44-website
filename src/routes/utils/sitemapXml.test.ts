import { describe, expect, it } from "vitest";

import { getSitemapXml } from "./sitemapXml";

describe("getSitemapXml", () => {
  it("lists home and every planet", () => {
    const urls = [...getSitemapXml().matchAll(/<loc>(.+?)<\/loc>/g)].map((match) => match[1]);

    expect(urls).toEqual([
      "https://gh44.dev/",
      "https://gh44.dev/me",
      "https://gh44.dev/gh44-confirm",
      "https://gh44.dev/work",
      "https://gh44.dev/gh44-theme",
      "https://gh44.dev/gh44-brain",
    ]);
  });
});

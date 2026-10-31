import { SITE_NAME, SITE_URL } from "#/utils/seo";

import { CONTACT_LINKS } from "./contactLinks";

// Tells search engines gh44.dev is the site of the person Gentrit Halili.
export const PERSON_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": `${SITE_URL}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Gentrit Halili",
      url: SITE_URL,
      jobTitle: "Senior Frontend Engineer",
      homeLocation: { "@type": "Place", name: "Pristina, Kosovo" },
      sameAs: CONTACT_LINKS.map((link) => link.href),
    },
  ],
};

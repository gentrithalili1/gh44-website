import { PageHeader } from "#/components/PageHeader";

import { ContactLink } from "./HomePage.elements";
import { messages } from "./messages";
import { CONTACT_LINKS } from "./utils/contactLinks";

export function HomePage() {
  return (
    <PageHeader variant="intro" title={messages.title} lead={messages.lead}>
      <ul
        aria-label={messages.contactLabel}
        className="mt-4 flex max-w-3xs flex-wrap justify-center gap-x-8 gap-y-3 sm:max-w-none"
      >
        {CONTACT_LINKS.map((link) => (
          <li key={link.href}>
            <ContactLink href={link.href} isExternal={link.isExternal}>
              {messages.contactLinkLabels[link.id]}
            </ContactLink>
          </li>
        ))}
      </ul>
    </PageHeader>
  );
}

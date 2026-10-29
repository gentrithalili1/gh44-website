import { PageWrapper } from "#/components/PageWrapper";

import { ContactLink } from "./HomePage.elements";
import { messages } from "./messages";
import { CONTACT_LINKS } from "./utils/contactLinks";

export function HomePage() {
  return (
    <PageWrapper variant="centered">
      <h1 className="text-display font-bold">{messages.title}</h1>
      <p className="max-w-prose text-lead text-muted-foreground">{messages.lead}</p>
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
    </PageWrapper>
  );
}

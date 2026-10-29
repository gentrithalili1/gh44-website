import { PageWrapper } from "#/components/PageWrapper";

import { ContactEmail } from "./components/ContactEmail";
import { HomeGreeting } from "./components/HomeGreeting";
import { HomeStatement } from "./components/HomeStatement";
import { ContactLink } from "./HomePage.elements";
import { messages } from "./messages";
import { CONTACT_EMAIL } from "./utils/contactEmail";
import { CONTACT_LINKS } from "./utils/contactLinks";

export function HomePage() {
  return (
    <PageWrapper>
      <hgroup className="grid gap-6 md:gap-8">
        <h1 className="font-mono text-intro font-bold">
          <span className="sr-only">{messages.title}</span>
          <HomeGreeting />
        </h1>
        <HomeStatement email={<ContactEmail />} />
      </hgroup>
      <ul
        aria-label={messages.contactLabel}
        className="flex flex-wrap gap-x-3.5 gap-y-3 sm:gap-x-6"
      >
        <li>
          <ContactLink href={`mailto:${CONTACT_EMAIL}`}>{messages.emailLinkLabel}</ContactLink>
        </li>
        {CONTACT_LINKS.map((link) => (
          <li key={link.href}>
            <ContactLink href={link.href} target="_blank" rel="noreferrer">
              {messages.contactLinkLabels[link.id]}
              <span className="sr-only"> {messages.opensInNewTab}</span>
            </ContactLink>
          </li>
        ))}
      </ul>
    </PageWrapper>
  );
}

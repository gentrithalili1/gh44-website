import { PageWrapper } from "#/components/PageWrapper";

import { ContactEmail } from "./components/ContactEmail";
import { HomeGreeting } from "./components/HomeGreeting";
import { ContactLink } from "./HomePage.elements";
import { messages } from "./messages";
import { CONTACT_LINKS } from "./utils/contactLinks";

export function HomePage() {
  return (
    <PageWrapper variant="centered">
      <hgroup className="flex w-full flex-col items-center gap-2">
        <h1 className="w-full text-intro font-bold">
          <span className="sr-only">{messages.title}</span>
          <HomeGreeting />
        </h1>
        <p className="max-w-prose text-lead text-muted-foreground">{messages.lead}</p>
      </hgroup>
      <div className="mt-4">
        <ContactEmail />
      </div>
      <ul
        aria-label={messages.contactLabel}
        className="flex flex-wrap justify-center gap-x-6 gap-y-3"
      >
        {CONTACT_LINKS.map((link) => (
          <li key={link.href}>
            <ContactLink href={link.href}>{messages.contactLinkLabels[link.id]}</ContactLink>
          </li>
        ))}
      </ul>
    </PageWrapper>
  );
}

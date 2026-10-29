import { PageWrapper } from "#/components/PageWrapper";

import { ContactEmail } from "./components/ContactEmail";
import { HomeGreeting } from "./components/HomeGreeting";
import { HomeStatement } from "./components/HomeStatement";
import { ContactLink } from "./HomePage.elements";
import { messages } from "./messages";
import { CONTACT_LINKS } from "./utils/contactLinks";

export function HomePage() {
  return (
    <PageWrapper variant="intro">
      <hgroup className="grid gap-6 md:gap-8">
        <h1 className="font-mono text-intro font-bold">
          <span className="sr-only">{messages.title}</span>
          <HomeGreeting />
        </h1>
        <HomeStatement />
      </hgroup>
      <div className="grid justify-items-start gap-5">
        <ContactEmail />
        <ul aria-label={messages.contactLabel} className="flex flex-wrap gap-x-6 gap-y-3">
          {CONTACT_LINKS.map((link) => (
            <li key={link.href}>
              <ContactLink href={link.href}>{messages.contactLinkLabels[link.id]}</ContactLink>
            </li>
          ))}
        </ul>
      </div>
    </PageWrapper>
  );
}

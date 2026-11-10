import { CONTACT_LINKS } from "#/routes/utils/contactLinks";
import { CONTACT_EMAIL, GMAIL_COMPOSE_URL } from "#/utils/contact";

import { ExternalLink } from "../ExternalLink";
import { ContactItem } from "./MePanel.elements";
import { messages } from "./messages";

export function MePanel() {
  return (
    <ul aria-label={messages.contactLabel} className="grid gap-3.5">
      <ContactItem label={messages.emailLabel}>
        {/* The address opens a Gmail compose window addressed to Gentrit. */}
        <ExternalLink href={GMAIL_COMPOSE_URL}>{CONTACT_EMAIL}</ExternalLink>
      </ContactItem>
      {CONTACT_LINKS.map((link) => (
        <ContactItem key={link.id} label={messages.contactLinkLabels[link.id]}>
          <ExternalLink href={link.href}>
            {link.handle}
            <span className="sr-only">, {messages.contactLinkLabels[link.id]}</span>
          </ExternalLink>
        </ContactItem>
      ))}
    </ul>
  );
}

import { CONTACT_LINKS } from "#/routes/utils/contactLinks";

import { ExternalLink } from "../ExternalLink";
import { ContactEmail } from "./components/ContactEmail";
import { ContactItem } from "./MePanel.elements";
import { messages } from "./messages";

export function MePanel() {
  return (
    <>
      <ul aria-label={messages.contactLabel} className="grid gap-3.5">
        <ContactItem label={messages.emailLabel}>
          <ContactEmail />
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
      <p className="mt-10 text-xs text-faint">{messages.copyHint}</p>
    </>
  );
}

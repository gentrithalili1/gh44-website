import { UNDERLINED_LINK_CLASS_NAME } from "../../utils/underlinedLink";
import { messages } from "./messages";

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
}

export function ExternalLink({ href, children }: ExternalLinkProps) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={UNDERLINED_LINK_CLASS_NAME}>
      {children} <span className="sr-only">{messages.opensInNewTab}</span>
    </a>
  );
}

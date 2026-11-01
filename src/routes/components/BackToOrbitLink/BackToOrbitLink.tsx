import { Link } from "@tanstack/react-router";

import { messages } from "./messages";

// Where the way back leads: the system, or the cockpit the visitor launched from.
type BackDestination = "orbit" | "cockpit";

interface BackToOrbitLinkProps {
  destination?: BackDestination;
  onClick?: () => void;
}

function getLabel(destination: BackDestination) {
  switch (destination) {
    case "orbit":
      return messages.backToOrbit;
    case "cockpit":
      return messages.backToCockpit;
    default: {
      const unknownDestination: never = destination;
      return unknownDestination;
    }
  }
}

// The way home, fixed in the top left corner. After a launch from the cockpit it leads back into
// the cockpit.
export function BackToOrbitLink({ destination = "orbit", onClick }: BackToOrbitLinkProps) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="fixed top-4 left-4 z-30 px-3 text-label leading-11 text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-muted"
    >
      <span aria-hidden="true">{messages.backArrow}</span> {getLabel(destination)}
    </Link>
  );
}

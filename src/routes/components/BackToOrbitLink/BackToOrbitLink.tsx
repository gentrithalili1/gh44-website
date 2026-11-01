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

// The way home, fixed top left: beside the music button on its center line, or in its own spot
// when there is no button. After a launch from the cockpit it leads back into the cockpit.
export function BackToOrbitLink({ destination = "orbit", onClick }: BackToOrbitLinkProps) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="fixed top-4 left-4 z-30 text-label text-muted transition-colors group-has-[[data-music-button]]/root:top-4 group-has-[[data-music-button]]/root:left-24 group-has-[[data-music-button]]/root:leading-11 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-muted md:top-8 md:left-10 md:group-has-[[data-music-button]]/root:top-4 md:group-has-[[data-music-button]]/root:left-30"
    >
      <span aria-hidden="true">{messages.backArrow}</span> {getLabel(destination)}
    </Link>
  );
}

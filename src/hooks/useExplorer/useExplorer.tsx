import { createContext, use, useRef, useState } from "react";

import type { Destination } from "#/utils/destinations";

// How an open cockpit appears: the camera flies to the ship in the scene first and the cockpit
// opens out of its window, or (no ship: reduced motion, no WebGL) it is there at once.
export type CockpitReveal = "flight" | "instant";

// A closing cockpit fades out while the camera pulls back; it is no longer a dialog by then. A
// greeting cockpit opened by itself on the session's first visit: the page behind stays readable
// and keeps focus until the visitor steps in.
type Cockpit =
  | { status: "closed" }
  | { status: "open"; reveal: CockpitReveal; isGreeting: boolean }
  | { status: "closing" };

// The ship's trip to a destination, from the cockpit's `go` to the page opening.
type ExplorerFlight = { status: "idle" } | { status: "flying"; destination: Destination };

// How a launch goes: the ship in the scene flies there first, or (no ship) the visitor arrives
// at once and the page opens now.
type LaunchOutcome = { status: "flying" } | { status: "arrived" };

type Explorer = {
  cockpit: Cockpit;
  flight: ExplorerFlight;
  // Does nothing while the ship flies to a destination: the launch can't be cancelled.
  openCockpit: () => void;
  // Opens a greeting cockpit, once a session; after that the visitor opens it themselves.
  greetVisitor: () => void;
  // The visitor stepped into the greeting cockpit: it is theirs now, a modal dialog.
  boardCockpit: () => void;
  closeCockpit: () => void;
  // The closing cockpit has faded out.
  finishClosing: () => void;
  // A ship in the scene boards when it mounts; without one there is nothing to fly.
  boardShip: () => () => void;
  hasShip: () => boolean;
  launch: (destination: Destination) => LaunchOutcome;
  endFlight: () => void;
  // The planet the visitor last launched to from the cockpit: its page leads back to the cockpit.
  cockpitTripPlanetId: string | undefined;
};

// Set once the cockpit has greeted this tab's visitor.
const GREETED_KEY = "gh44-cockpit-greeted";

const CLOSED: Cockpit = { status: "closed" };
const CLOSING: Cockpit = { status: "closing" };
const IDLE: ExplorerFlight = { status: "idle" };

const ExplorerContext = createContext<Explorer | null>(null);

interface ExplorerProviderProps {
  children: React.ReactNode;
}

// The gh44 explorer's state: its cockpit and its flight. The ship in the system and the cockpit
// share it.
export function ExplorerProvider({ children }: ExplorerProviderProps) {
  const [cockpit, setCockpit] = useState<Cockpit>(CLOSED);
  const [flight, setFlight] = useState<ExplorerFlight>(IDLE);
  const [cockpitTripPlanetId, setCockpitTripPlanetId] = useState<string>();
  // How many ships are in the scene: read in handlers only, so it never re-renders.
  const shipCountRef = useRef(0);

  function hasShip() {
    return shipCountRef.current > 0;
  }

  const explorer: Explorer = {
    cockpit,
    flight,
    openCockpit: () => {
      if (flight.status === "flying") return;
      setCockpitTripPlanetId(undefined);
      setCockpit({ status: "open", reveal: hasShip() ? "flight" : "instant", isGreeting: false });
    },
    greetVisitor: () => {
      if (sessionStorage.getItem(GREETED_KEY) !== null) return;
      sessionStorage.setItem(GREETED_KEY, "true");
      setCockpit({ status: "open", reveal: hasShip() ? "flight" : "instant", isGreeting: true });
    },
    boardCockpit: () =>
      setCockpit((current) =>
        current.status === "open" && current.isGreeting
          ? { ...current, isGreeting: false }
          : current,
      ),
    closeCockpit: () =>
      setCockpit((current) =>
        current.status === "open" && current.reveal === "flight" ? CLOSING : CLOSED,
      ),
    finishClosing: () => setCockpit((current) => (current.status === "closing" ? CLOSED : current)),
    boardShip: () => {
      shipCountRef.current += 1;
      return () => {
        shipCountRef.current -= 1;
      };
    },
    hasShip,
    launch: (destination) => {
      setCockpitTripPlanetId(destination.name);
      if (hasShip()) {
        setFlight({ status: "flying", destination });
        return { status: "flying" };
      }
      setCockpit(CLOSED);
      return { status: "arrived" };
    },
    endFlight: () => setFlight(IDLE),
    cockpitTripPlanetId,
  };

  return <ExplorerContext value={explorer}>{children}</ExplorerContext>;
}

export function useExplorer() {
  const explorer = use(ExplorerContext);
  if (!explorer) throw new Error("useExplorer needs an ExplorerProvider above it");

  return explorer;
}

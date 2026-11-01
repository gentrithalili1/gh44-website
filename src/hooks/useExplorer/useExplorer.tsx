import { createContext, use, useRef, useState } from "react";

import type { Destination } from "#/utils/destinations";

// How an open cockpit appears: the camera flies to the ship in the scene first and the cockpit
// opens out of its window, or (no ship: reduced motion, no WebGL) it is there at once.
export type CockpitReveal = "flight" | "instant";

// A closing cockpit fades out while the camera pulls back; it is no longer a dialog by then.
type Cockpit =
  | { status: "closed" }
  | { status: "open"; reveal: CockpitReveal }
  | { status: "closing" };

// The ship's trip to a destination, from the cockpit's `go` to the page opening.
type ExplorerFlight = { status: "idle" } | { status: "flying"; destination: Destination };

type Explorer = {
  cockpit: Cockpit;
  flight: ExplorerFlight;
  // Does nothing while the ship flies to a destination: the launch can't be cancelled.
  openCockpit: () => void;
  closeCockpit: () => void;
  // The closing cockpit has faded out.
  finishClosing: () => void;
  // A ship in the scene boards when it mounts; without one there is nothing to fly.
  boardShip: () => () => void;
  hasShip: () => boolean;
  startFlight: (destination: Destination) => void;
  endFlight: () => void;
};

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
      setCockpit({ status: "open", reveal: hasShip() ? "flight" : "instant" });
    },
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
    startFlight: (destination) => setFlight({ status: "flying", destination }),
    endFlight: () => setFlight(IDLE),
  };

  return <ExplorerContext value={explorer}>{children}</ExplorerContext>;
}

export function useExplorer() {
  const explorer = use(ExplorerContext);
  if (!explorer) throw new Error("useExplorer needs an ExplorerProvider above it");

  return explorer;
}

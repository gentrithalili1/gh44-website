import { createContext, use, useRef, useState } from "react";

import type { Destination } from "#/utils/destinations";
import { GARGANTUA_YEARS } from "#/utils/explorer";

export type CockpitReveal = "flight" | "instant";

type Cockpit =
  | { status: "closed" }
  | { status: "open"; reveal: CockpitReveal; isGreeting: boolean }
  | { status: "closing" };

// The ship's trip to a destination, from the cockpit's `go` to the page opening.
type ExplorerFlight = { status: "idle" } | { status: "flying"; destination: Destination };

type ExplorerJump =
  | { status: "idle" }
  | { status: "jumping" }
  | { status: "inside" }
  | { status: "returning" };

type LaunchOutcome = { status: "flying" } | { status: "arrived" };

type Explorer = {
  cockpit: Cockpit;
  flight: ExplorerFlight;
  // Does nothing while the ship flies to a destination: the launch can't be cancelled.
  openCockpit: () => void;
  // Opens a greeting cockpit, once a page load; after that the visitor opens it themselves.
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
  jump: ExplorerJump;
  startJump: (onArrive: () => void) => void;
  // The flight in is over: nothing but black.
  reachHorizon: () => void;
  // Leaves the inside: the ship flies back out to the solar system (at once without a ship).
  endJump: () => void;
  // The flight back is over: time has passed on Earth.
  finishJump: () => void;
  // The years that passed on Earth while the visitor was in the black hole; a reload starts over.
  earthYearsPassed: number;
  // The planet the visitor last launched to from the cockpit: its page leads back to the cockpit.
  cockpitTripPlanetId: string | undefined;
};

const CLOSED: Cockpit = { status: "closed" };
const CLOSING: Cockpit = { status: "closing" };
const IDLE: ExplorerFlight = { status: "idle" };
const NOT_JUMPING: ExplorerJump = { status: "idle" };
const JUMPING: ExplorerJump = { status: "jumping" };
const INSIDE: ExplorerJump = { status: "inside" };
const RETURNING: ExplorerJump = { status: "returning" };

const ExplorerContext = createContext<Explorer | null>(null);

interface ExplorerProviderProps {
  children: React.ReactNode;
}

export function ExplorerProvider({ children }: ExplorerProviderProps) {
  const [cockpit, setCockpit] = useState<Cockpit>(CLOSED);
  const [flight, setFlight] = useState<ExplorerFlight>(IDLE);
  const [cockpitTripPlanetId, setCockpitTripPlanetId] = useState<string>();
  const [jump, setJump] = useState<ExplorerJump>(NOT_JUMPING);
  const [earthYearsPassed, setEarthYearsPassed] = useState(0);
  // What to do on the other side of the black hole: read in handlers only.
  const arriveRef = useRef<(() => void) | null>(null);
  // How many ships are in the scene: read in handlers only, so it never re-renders.
  const shipCountRef = useRef(0);
  // The cockpit greets once per page load: every visit opens in it, a closed one stays closed.
  const hasGreetedRef = useRef(false);

  function hasShip() {
    return shipCountRef.current > 0;
  }

  function finishJump() {
    setJump(NOT_JUMPING);
    setEarthYearsPassed((years) => years + GARGANTUA_YEARS);
    arriveRef.current?.();
    arriveRef.current = null;
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
      if (hasGreetedRef.current) return;
      hasGreetedRef.current = true;
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
    jump,
    startJump: (onArrive) => {
      arriveRef.current = onArrive;
      setJump(hasShip() ? JUMPING : INSIDE);
    },
    reachHorizon: () => setJump((current) => (current.status === "jumping" ? INSIDE : current)),
    endJump: () => {
      if (hasShip()) setJump((current) => (current.status === "inside" ? RETURNING : current));
      else finishJump();
    },
    finishJump,
    earthYearsPassed,
    cockpitTripPlanetId,
  };

  return <ExplorerContext value={explorer}>{children}</ExplorerContext>;
}

export function useExplorer() {
  const explorer = use(ExplorerContext);
  if (!explorer) throw new Error("useExplorer needs an ExplorerProvider above it");

  return explorer;
}

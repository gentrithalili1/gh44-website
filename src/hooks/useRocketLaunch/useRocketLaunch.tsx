import { createContext, use, useReducer } from "react";

export type LaunchStatus = "idle" | "asking" | "launched" | "aborted";

type RocketLaunch = {
  status: LaunchStatus;
  // A new rocket stands on the pad for every launch.
  launchId: number;
  // Every launched rocket stays in orbit around Mars, the oldest leaving past the cap.
  orbitingIds: number[];
  ask: () => void;
  launch: () => void;
  abort: () => void;
};

// Without a provider (a planet drawn on its own) no rocket ever stands on the pad.
const NO_LAUNCH: RocketLaunch = {
  status: "idle",
  launchId: 0,
  orbitingIds: [],
  ask: () => {},
  launch: () => {},
  abort: () => {},
};

const MAX_ORBITING_ROCKETS = 8;

const RocketLaunchContext = createContext<RocketLaunch>(NO_LAUNCH);

interface RocketLaunchProviderProps {
  children: React.ReactNode;
}

type LaunchState = Pick<RocketLaunch, "status" | "launchId" | "orbitingIds">;
type LaunchAction = "ask" | "launch" | "abort";

const INITIAL_STATE: LaunchState = { status: "idle", launchId: 0, orbitingIds: [] };

// The demo calls launch after awaiting the dialog: the reducer reads the state as it is then.
function launchReducer(state: LaunchState, action: LaunchAction): LaunchState {
  switch (action) {
    case "ask":
      return { ...state, status: "asking", launchId: state.launchId + 1 };
    case "launch":
      if (state.status !== "asking") return state;
      return {
        ...state,
        status: "launched",
        orbitingIds: [...state.orbitingIds, state.launchId].slice(-MAX_ORBITING_ROCKETS),
      };
    case "abort":
      return { ...state, status: "aborted" };
    default: {
      const unknownAction: never = action;
      return unknownAction;
    }
  }
}

// The launch is the panel's demo, and the rocket flies in the scene: both read it from here.
export function RocketLaunchProvider({ children }: RocketLaunchProviderProps) {
  const [state, dispatch] = useReducer(launchReducer, INITIAL_STATE);

  const rocketLaunch: RocketLaunch = {
    ...state,
    ask: () => dispatch("ask"),
    launch: () => dispatch("launch"),
    abort: () => dispatch("abort"),
  };

  return <RocketLaunchContext value={rocketLaunch}>{children}</RocketLaunchContext>;
}

export function useRocketLaunch() {
  return use(RocketLaunchContext);
}

// The rocket stands on the pad while the visitor is asked, and flies once they say launch.
export function isRocketOnStage(status: LaunchStatus) {
  return status === "asking" || status === "launched";
}

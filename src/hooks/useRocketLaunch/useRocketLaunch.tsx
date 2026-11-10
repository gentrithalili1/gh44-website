import { createContext, use, useState } from "react";

// How gh44-confirm's demo launch goes: asking puts a rocket on Mars' pad, launched flies it off
// the planet, aborted takes it down.
export type LaunchStatus = "idle" | "asking" | "launched" | "aborted";

type RocketLaunch = {
  status: LaunchStatus;
  // A new rocket stands on the pad for every launch.
  launchId: number;
  ask: () => void;
  launch: () => void;
  abort: () => void;
};

// Without a provider (a planet drawn on its own) no rocket ever stands on the pad.
const NO_LAUNCH: RocketLaunch = {
  status: "idle",
  launchId: 0,
  ask: () => {},
  launch: () => {},
  abort: () => {},
};

const RocketLaunchContext = createContext<RocketLaunch>(NO_LAUNCH);

interface RocketLaunchProviderProps {
  children: React.ReactNode;
}

// The launch is the panel's demo, and the rocket flies in the scene: both read it from here.
export function RocketLaunchProvider({ children }: RocketLaunchProviderProps) {
  const [status, setStatus] = useState<LaunchStatus>("idle");
  const [launchId, setLaunchId] = useState(0);

  const rocketLaunch: RocketLaunch = {
    status,
    launchId,
    ask: () => {
      setStatus("asking");
      setLaunchId((id) => id + 1);
    },
    launch: () => setStatus("launched"),
    abort: () => setStatus("aborted"),
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

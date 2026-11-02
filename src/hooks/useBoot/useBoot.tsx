import { createContext, use, useState } from "react";

type Boot = {
  // three.js loaded and the 3D scene's canvas is live.
  isSceneReady: boolean;
  markSceneReady: () => void;
};

const BootContext = createContext<Boot | null>(null);

interface BootProviderProps {
  children: React.ReactNode;
}

// Shares whether the 3D scene is ready, so the boot screen can wait for it.
export function BootProvider({ children }: BootProviderProps) {
  const [isSceneReady, setIsSceneReady] = useState(false);

  const boot: Boot = {
    isSceneReady,
    markSceneReady: () => setIsSceneReady(true),
  };

  return <BootContext value={boot}>{children}</BootContext>;
}

export function useBoot() {
  const boot = use(BootContext);
  if (!boot) throw new Error("useBoot must be used inside BootProvider");

  return boot;
}

import { useRef, useState } from "react";

import type { CopyStatus } from "../../types";

// How long "copied" or "failed" shows before the button resets.
const RESET_DELAY_MS = 2000;

export function useCopyText() {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const copy = async (text: string) => {
    clearTimeout(resetTimerRef.current);
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      // No clipboard access (insecure page or denied permission): the caller shows the failure.
      setStatus("failed");
    }
    resetTimerRef.current = setTimeout(() => setStatus("idle"), RESET_DELAY_MS);
  };

  return { status, copy };
}

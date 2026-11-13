import { useRef } from "react";

import { speakFloki } from "#/routes/components/Cockpit/components/CockpitWindow/hooks/useFloki/hooks/useFlokiVoice/speakFloki";

export function useFlokiLine() {
  const isBusyRef = useRef(false);

  async function say(text: string) {
    if (isBusyRef.current) return;
    isBusyRef.current = true;
    try {
      const speech = await speakFloki({ data: text });
      if (speech.status !== "spoken") return;
      const audio = new Audio(speech.audioUrl);
      await audio.play();
      await new Promise((resolve) => audio.addEventListener("ended", resolve, { once: true }));
    } catch {
      // The request failed or the browser blocked the sound: whoever asked shows the line too.
    } finally {
      isBusyRef.current = false;
    }
  }

  return { say };
}

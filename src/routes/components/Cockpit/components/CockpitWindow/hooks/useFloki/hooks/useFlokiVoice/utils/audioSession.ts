type AudioSessionType = "playback" | "auto";

export function setAudioSessionType(type: AudioSessionType) {
  if (!("audioSession" in navigator)) return;
  const session: unknown = navigator.audioSession;
  if (typeof session !== "object" || session === null || !("type" in session)) return;
  try {
    Reflect.set(session, "type", type);
  } catch {
    // Refused (an older Safari): the line still plays, the silent switch may mute it.
  }
}

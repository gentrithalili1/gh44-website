// The probe shows up once the visitor has left the home view alone this long (seconds), and
// takes this long to cross.
export const IDLE_SECONDS = 120;
export const PASS_SECONDS = 50;
// It crosses behind the sun, a little above the orbit plane, left to right: scene units.
const PASS = { fromX: -640, toX: 640, y: 46, z: -250 } as const;

// Waiting for the visitor to go idle, crossing, or gone for this visit.
export type VoyagerPass =
  | { status: "waiting"; idle: number }
  | { status: "crossing"; progress: number }
  | { status: "gone" };

export const WAITING: VoyagerPass = { status: "waiting", idle: 0 };

type StepPassParams = {
  pass: VoyagerPass;
  delta: number;
  // The home view, with nothing open and the pointer still.
  isIdle: boolean;
};

// Moves the pass one frame on. Any activity starts the wait over; once crossing it carries on
// whatever the visitor does.
export function stepPass({ pass, delta, isIdle }: StepPassParams): VoyagerPass {
  switch (pass.status) {
    case "waiting": {
      if (!isIdle) return WAITING;
      const idle = pass.idle + delta;
      return idle >= IDLE_SECONDS
        ? { status: "crossing", progress: 0 }
        : { status: "waiting", idle };
    }
    case "crossing": {
      const progress = pass.progress + delta / PASS_SECONDS;
      return progress >= 1 ? { status: "gone" } : { status: "crossing", progress };
    }
    case "gone":
      return pass;
    default: {
      const unknownPass: never = pass;
      return unknownPass;
    }
  }
}

// Where the probe is, `progress` (0 to 1) of the way across.
export function getPassPosition(progress: number): [number, number, number] {
  return [PASS.fromX + (PASS.toX - PASS.fromX) * progress, PASS.y, PASS.z];
}

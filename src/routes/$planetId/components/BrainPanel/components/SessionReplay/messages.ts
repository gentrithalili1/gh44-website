import type { ReplayLine } from "./utils/replayFrames";

export const messages = {
  caption: "replay · a recorded session, not live",
  replay: "replay",
  replayLabel: "replay the session",
  promptMark: ">",
  // A ticket from clarify to pull request, in gh44-brain's workflow.
  script: [
    { id: "clarify", kind: "prompt", text: "/gh44-clarify ABC-123" },
    {
      id: "clarify-reply",
      kind: "reply",
      text: "read the ticket. 3 questions, each with a recommended answer.",
    },
    { id: "answers", kind: "prompt", text: "1 and 2 as you say. 3: keep it in the url" },
    { id: "plan", kind: "prompt", text: "/gh44-plan" },
    {
      id: "plan-reply",
      kind: "reply",
      text: "goal, approach, 4 slices with acceptance criteria. approve?",
    },
    { id: "approve", kind: "prompt", text: "approved" },
    { id: "implement", kind: "prompt", text: "/gh44-implement" },
    {
      id: "implement-reply",
      kind: "reply",
      text: "built in the background, each slice red → green. verified, reviewed. 1 call for you.",
    },
    { id: "decide", kind: "prompt", text: "apply it" },
    { id: "create-pr", kind: "prompt", text: "/gh44-create-pr" },
    { id: "create-pr-reply", kind: "reply", text: "committed, pushed, pull request open." },
  ],
} as const satisfies { script: readonly ReplayLine[] } & Record<string, unknown>;

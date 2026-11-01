export const messages = {
  installLabel: "install gh44-brain",
  installTab: "install",
  installNote: "needs homebrew, node and pnpm. then open a new claude code session.",
  sessionHeading: "a session",
  learningHeading: "learning loop",
  learningSteps: [
    { id: "capture", name: "capture", text: "a short correction lands in the inbox." },
    { id: "learn", name: "learn", text: "claude writes it into the brain as a rule." },
    { id: "ingest", name: "ingest", text: "/gh44-learn ingest sorts what's left in the inbox." },
    { id: "tidy", name: "tidy", text: "/gh44-learn tidy merges duplicates, drops stale rules." },
    { id: "retro", name: "retro", text: "/gh44-learn retro finds friction i never corrected." },
  ],
} as const;

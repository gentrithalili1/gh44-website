export const messages = {
  label: "the tesseract: every commit of this site",
  flokiPrompt: "floki>",
  visitorPrompt: "you>",
  // What Floki says in there until the visitor talks to him.
  flokiLine: "we're inside. ask me what this is, or say go back.",
  askLabel: "ask floki",
  askPlaceholder: "ask floki… (what is this? / let's go back)",
  talk: "talk",
  talkLabel: "talk to floki",
  stop: "stop",
  stopLabel: "stop floki",
  status: { idle: "", listening: "listening…", thinking: "thinking…", speaking: "" },
  count: ({ index, total }: { index: number; total: number }) => `commit ${index} of ${total}`,
  shelfLabel: "commits, oldest to newest",
  bookLabel: ({ date, subject }: { date: string; subject: string }) => `${date}: ${subject}`,
  back: "go back",
} as const;

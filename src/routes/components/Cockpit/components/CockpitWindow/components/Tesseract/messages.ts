export const messages = {
  label: "the tesseract: every commit of this site",
  // What Floki says in there, under the commit in view.
  flokiPrompt: "floki>",
  flokiLine: "pick a book. i'll send it back.",
  count: ({ index, total }: { index: number; total: number }) => `commit ${index} of ${total}`,
  shelfLabel: "commits, oldest to newest",
  bookLabel: ({ date, subject }: { date: string; subject: string }) => `${date}: ${subject}`,
  back: "go back",
} as const;

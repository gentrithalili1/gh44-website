// How the voice should say words it gets wrong: Floki with a light L, "Flokee".
const PRONUNCIATIONS = [[/\bfloki\b/gi, "Flokee"]] as const;

// A line as the voice reads it; the screen keeps the real spelling.
export function getSpokenText(text: string) {
  return PRONUNCIATIONS.reduce((spoken, [word, sound]) => spoken.replace(word, sound), text);
}

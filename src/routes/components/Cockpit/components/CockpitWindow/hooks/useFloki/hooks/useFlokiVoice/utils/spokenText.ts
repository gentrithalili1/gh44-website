// How the voice should say words it gets wrong, as raw Piper phonemes in [[ ]]: Floki like the
// Vikings character, FLOH-kee.
const PRONUNCIATIONS = [[/\bfloki\b/gi, "[[ flˈoʊki ]]"]] as const;

// A line as the voice reads it; the screen keeps the real spelling.
export function getSpokenText(text: string) {
  return PRONUNCIATIONS.reduce((spoken, [word, sound]) => spoken.replace(word, sound), text);
}

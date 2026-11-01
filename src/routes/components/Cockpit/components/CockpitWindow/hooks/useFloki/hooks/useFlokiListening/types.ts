// The parts of the Web Speech API's SpeechRecognition that Floki uses. TypeScript's DOM types
// have its events but not the class, which Chrome and Safari still prefix.
export type SpeechRecognitionLike = EventTarget & {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

export type SpeechRecognitionClass = new () => SpeechRecognitionLike;

import { messages } from "./messages";

// "nav>" before each command, like "floki>" and "you>" before what they say.
export function TerminalPrompt() {
  return <span className="whitespace-nowrap text-blue">{messages.prompt}</span>;
}

// "floki>" before what the onboard computer says.
export function FlokiPrompt() {
  return <span className="whitespace-nowrap text-lavender">{messages.floki.prompt}</span>;
}

// "you>" before what the visitor said to Floki.
export function VisitorPrompt() {
  return <span className="whitespace-nowrap text-sage">{messages.floki.visitorPrompt}</span>;
}

interface TerminalCursorProps {
  // The character under the block; a space at the end of the line.
  children: React.ReactNode;
}

// A block cursor in the theme's cursor color: solid and blinking while the command line has
// focus, hollow without it.
export function TerminalCursor({ children }: TerminalCursorProps) {
  return (
    <span className="outline-1 -outline-offset-1 outline-terracotta group-focus-within:animate-cursor-blink group-focus-within:bg-terracotta group-focus-within:text-night group-focus-within:outline-0">
      {children}
    </span>
  );
}

import { messages } from "./messages";

// The window's buttons, in the Warp theme's red, yellow and green.
const WINDOW_DOT_COLORS = ["bg-red", "bg-ochre", "bg-sage"] as const;

export function TerminalTitleBar() {
  return (
    <div className="relative flex h-8 shrink-0 items-center border-b border-border-subtle bg-bg-subtle px-3">
      <span aria-hidden="true" className="flex gap-1.5">
        {WINDOW_DOT_COLORS.map((color) => (
          <span key={color} className={`size-2.5 rounded-full ${color}`} />
        ))}
      </span>
      <p className="absolute inset-x-16 truncate text-center text-xs text-muted">
        {messages.title}
      </p>
    </div>
  );
}

// "gh44@explorer:~$" in the Warp theme's prompt colors: user green, path blue.
export function TerminalPrompt() {
  return (
    <span className="whitespace-nowrap">
      <span className="text-sage">{messages.prompt.user}</span>
      {messages.prompt.separator}
      <span className="text-blue">{messages.prompt.path}</span>
      {messages.prompt.symbol}
    </span>
  );
}

// "floki>" before what the onboard computer says.
export function FlokiPrompt() {
  return <span className="whitespace-nowrap text-lavender">{messages.floki.prompt}</span>;
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

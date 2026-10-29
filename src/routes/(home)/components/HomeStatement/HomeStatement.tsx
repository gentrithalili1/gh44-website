import { messages } from "./messages";

export function HomeStatement() {
  return (
    <p className="max-w-[34ch] text-statement text-pretty text-muted-foreground">
      <span className="text-foreground">{messages.role}</span>
    </p>
  );
}

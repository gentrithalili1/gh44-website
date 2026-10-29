import { messages } from "./messages";

export function HomePage() {
  return (
    <section className="grid gap-6">
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground">
        <span className="size-2 animate-pulse rounded-full bg-primary motion-reduce:animate-none" />
        {messages.status}
      </span>
      <h1 className="text-5xl font-bold tracking-tight">{messages.heading}</h1>
      <p className="text-muted-foreground">{messages.intro}</p>
    </section>
  );
}

import { messages } from "./messages";

export function Gh44ThemePage() {
  return (
    <section className="grid justify-items-start gap-5 pt-8 md:pt-16">
      <h1 className="text-title font-bold">{messages.heading}</h1>
      <p className="max-w-prose text-lead text-muted-foreground">{messages.comingSoon}</p>
    </section>
  );
}

import { SectionLink } from "./HomeStatement.elements";
import { messages } from "./messages";

// One sentence that says what Gentrit does and links each section in its accent.
export function HomeStatement() {
  return (
    <p className="max-w-[34ch] text-statement text-pretty text-muted-foreground">
      <span className="text-foreground">{messages.role}</span> {messages.makeStart}{" "}
      <SectionLink sectionId="gh44-brain" to="/gh44-brain">
        {messages.gh44Brain}
      </SectionLink>{" "}
      {messages.and}{" "}
      <SectionLink sectionId="gh44-theme" to="/gh44-theme">
        {messages.gh44Theme}
      </SectionLink>
      {messages.makeEnd} {messages.workStart}{" "}
      <SectionLink sectionId="work" to="/work">
        {messages.workLink}
      </SectionLink>{" "}
      {messages.workEnd}
    </p>
  );
}

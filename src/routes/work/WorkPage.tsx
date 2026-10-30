import { PageWrapper } from "#/components/PageWrapper";
import { cn } from "#/lib/utils";
import { SECTIONS } from "#/utils/sections";

import { messages } from "./messages";

export function WorkPage() {
  return (
    <PageWrapper>
      <hgroup className="grid gap-6 md:gap-8">
        <h1
          className={cn(
            "font-mono text-intro font-bold text-balance",
            SECTIONS["work"].textClassName,
          )}
        >
          {messages.heading}
        </h1>
      </hgroup>
    </PageWrapper>
  );
}

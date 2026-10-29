import { PageWrapper } from "#/components/PageWrapper";

import { messages } from "./messages";

export function WorkPage() {
  return (
    <PageWrapper>
      <h1 className="text-title font-bold">{messages.heading}</h1>
      <p className="max-w-prose text-lead text-muted-foreground">{messages.comingSoon}</p>
    </PageWrapper>
  );
}

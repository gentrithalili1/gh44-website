import { PageHeader } from "#/components/PageHeader";

import { messages } from "./messages";

export function WorkPage() {
  return <PageHeader variant="page" title={messages.heading} lead={messages.comingSoon} />;
}

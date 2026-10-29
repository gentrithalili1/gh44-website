import type { ReactNode } from "react";

import { messages } from "./messages";

interface HomeStatementProps {
  email: ReactNode;
}

export function HomeStatement({ email }: HomeStatementProps) {
  return (
    <p className="max-w-[34ch] text-statement text-pretty text-foreground">
      <span className="block">{messages.role}</span>
      <span className="block text-[0.75em] leading-[1.4]">
        {messages.writeTo} {email}
      </span>
    </p>
  );
}

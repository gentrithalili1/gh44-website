import type { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  return <section className="grid justify-items-start gap-8 pt-8 md:pt-16">{children}</section>;
}

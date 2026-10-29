import type { ReactNode } from "react";

import { PAGE_WRAPPER_VARIANTS, type PageWrapperVariant } from "./utils/variants";

interface PageWrapperProps {
  variant?: PageWrapperVariant;
  children: ReactNode;
}

// The shared page layout: every page renders its content inside one.
export function PageWrapper({ variant = "default", children }: PageWrapperProps) {
  return <section className={PAGE_WRAPPER_VARIANTS[variant]}>{children}</section>;
}

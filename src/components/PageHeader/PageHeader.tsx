import type { ReactNode } from "react";

import { PAGE_HEADER_VARIANTS, type PageHeaderVariant } from "./utils/variants";

interface PageHeaderProps {
  variant: PageHeaderVariant;
  title: string;
  lead: string;
  children?: ReactNode;
}

export function PageHeader({ variant, title, lead, children }: PageHeaderProps) {
  const classNames = PAGE_HEADER_VARIANTS[variant];

  return (
    <header className={classNames.rootClassName}>
      <h1 className={classNames.titleClassName}>{title}</h1>
      <p className={classNames.leadClassName}>{lead}</p>
      {children}
    </header>
  );
}

export const PAGE_HEADER_VARIANTS = {
  page: {
    rootClassName: "grid justify-items-start gap-5 pt-8 md:pt-16",
    titleClassName: "text-title font-bold",
    leadClassName: "max-w-prose text-lead text-muted-foreground",
  },
  intro: {
    rootClassName:
      "flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center text-balance",
    titleClassName: "text-display font-bold",
    leadClassName: "max-w-prose text-lead text-muted-foreground",
  },
} as const;

export type PageHeaderVariant = keyof typeof PAGE_HEADER_VARIANTS;

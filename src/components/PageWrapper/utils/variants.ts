export const PAGE_WRAPPER_VARIANTS = {
  default: "grid justify-items-start gap-5 pt-8 md:pt-16",
  centered:
    "flex flex-1 flex-col items-center justify-center gap-6 py-6 text-center md:py-16 text-balance",
} as const;

export type PageWrapperVariant = keyof typeof PAGE_WRAPPER_VARIANTS;

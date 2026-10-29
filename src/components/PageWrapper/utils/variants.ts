export const PAGE_WRAPPER_VARIANTS = {
  default: "grid justify-items-start gap-5 pt-8 md:pt-16",
  intro: "flex flex-1 flex-col justify-center gap-8 py-6 md:py-16",
} as const;

export type PageWrapperVariant = keyof typeof PAGE_WRAPPER_VARIANTS;

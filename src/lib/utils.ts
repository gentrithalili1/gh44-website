import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The custom font sizes from styles.css: without them, `text-intro` reads as a
// color and merging it with a color class like `text-success` drops it.
const twMerge = extendTailwindMerge({
  extend: { theme: { text: ["intro", "statement", "headline", "logo"] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

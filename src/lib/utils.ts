import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach the merger which custom utilities are sizes and which are shadows.
// Otherwise `text-body text-text` loses its font size during a merge.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "heading",
            "body",
            "label",
            "caption",
            "display",
            "heading-page",
            "vital-metric",
          ],
        },
      ],
      shadow: [
        {
          shadow: [
            "card",
            "floating",
            "critical",
            "focus",
            "cta",
            "nav-bar",
            "control",
            "card-device",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { useMemo } from "react";
import { aboutParagraphs } from "../utils/about-content";

export function useAboutContent() {
  return useMemo(
    () => ({
      title: "About Repromas",
      paragraphs: [...aboutParagraphs],
    }),
    [],
  );
}

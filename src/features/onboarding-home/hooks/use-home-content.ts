import { useMemo } from "react";
import { homeHighlights } from "../utils/home-content";

export function useHomeContent() {
  return useMemo(
    () => ({
      title: "Repromas for Institutions",
      subtitle:
        "Manage admissions, structure, and student workflows in one platform.",
      highlights: [...homeHighlights],
    }),
    [],
  );
}

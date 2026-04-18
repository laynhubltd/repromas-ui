import type { UseTokenReturn } from "@/shared/hooks/useToken";
import type { StateCategory } from "../types/student-transition-status";

/**
 * Maps a StateCategory value to the corresponding Ant Design color token key.
 * POSITIVE → colorSuccess (green)
 * NEGATIVE → colorError (red)
 * NEUTRAL  → colorTextTertiary (grey)
 */
export function getStateCategoryColor(
  category: StateCategory,
  token: UseTokenReturn
): string {
  const colorMap: Record<StateCategory, string> = {
    POSITIVE: token.colorSuccess,
    NEGATIVE: token.colorError,
    NEUTRAL: token.colorTextTertiary,
  };
  return colorMap[category];
}

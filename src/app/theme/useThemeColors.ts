import { useAppSelector } from "@/app/hooks";
import { buildColors } from "@/app/theme/themeConfig";

/**
 * Returns color variants derived from the active primary color in the Redux store.
 * Use this instead of calling buildColors(DEFAULT_PRIMARY) at module level.
 */
export function useThemeColors() {
  const primaryColor = useAppSelector((state) => state.theme.primaryColor);
  return buildColors(primaryColor);
}

import { Grid } from "antd";

const { useBreakpoint } = Grid;

/** True when viewport is below md (768px). Use for mobile/tablet layout. */
export function useIsMobile(): boolean {
  const screens = useBreakpoint();
  return !screens.md;
}

/** True when viewport is xs only (< 576px). Use for smallest mobile layout. */
export function useIsXs(): boolean | null | undefined {
  const screens = useBreakpoint();
  return screens.xs && !screens.sm;
}

/** True when viewport is sm–md (576px–767px). Use for tablet layout. */
export function useIsTablet(): boolean {
  const screens = useBreakpoint();
  return !!screens.sm && !screens.md;
}

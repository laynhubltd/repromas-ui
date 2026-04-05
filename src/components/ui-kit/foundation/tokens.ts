import type { UIComponentDensity, UIComponentSize } from "./props";

export type AntdSize = "small" | "middle" | "large";

export const UI_SIZE_TO_ANTD_SIZE: Record<UIComponentSize, AntdSize> = {
  sm: "small",
  md: "middle",
  lg: "large",
};

export const UI_DENSITY_SPACING: Record<UIComponentDensity, number> = {
  compact: 8,
  comfortable: 12,
  spacious: 16,
};

export const UI_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
} as const;

export const UI_BREAKPOINTS = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const;

export function toAntdSize(size: UIComponentSize = "md"): AntdSize {
  return UI_SIZE_TO_ANTD_SIZE[size];
}

export function toSpacingUnit(density: UIComponentDensity = "comfortable"): number {
  return UI_DENSITY_SPACING[density];
}

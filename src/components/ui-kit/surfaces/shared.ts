import { theme } from "antd";
import type { CSSProperties } from "react";
import type {
  UIComponentDensity,
  UIComponentState,
  UIComponentVariant,
  UIResponsiveBehavior,
  UIResponsiveBreakpoint,
  UIResponsiveMode,
} from "../foundation";
import { toSpacingUnit } from "../foundation";

type AntdToken = ReturnType<typeof theme.useToken>["token"];
type ScreenState = Partial<Record<UIResponsiveBreakpoint, boolean>>;

const BREAKPOINT_PRIORITY: UIResponsiveBreakpoint[] = ["xl", "lg", "md", "sm", "xs"];
const BREAKPOINT_FALLBACK: UIResponsiveBreakpoint[] = ["md", "sm", "xs", "lg", "xl"];

export function resolveResponsiveMode(
  responsive: UIResponsiveBehavior | undefined,
  screens: ScreenState,
): UIResponsiveMode {
  if (!responsive) {
    return "inline";
  }

  for (const breakpoint of BREAKPOINT_PRIORITY) {
    if (screens[breakpoint] && responsive[breakpoint]) {
      return responsive[breakpoint];
    }
  }

  for (const breakpoint of BREAKPOINT_FALLBACK) {
    if (responsive[breakpoint]) {
      return responsive[breakpoint];
    }
  }

  return "inline";
}

export function isStackedMode(mode: UIResponsiveMode): boolean {
  return mode === "stack" || mode === "collapse";
}

export function getResponsiveSpacing(
  density: UIComponentDensity = "comfortable",
  screens: ScreenState,
): number {
  const base = toSpacingUnit(density);

  if (!screens.md) {
    return base;
  }
  if (screens.xl) {
    return base + 6;
  }
  if (screens.lg) {
    return base + 4;
  }
  return base + 2;
}

export function toAntdCardVariant(variant: UIComponentVariant = "default"): "outlined" | "borderless" {
  return variant === "ghost" ? "borderless" : "outlined";
}

export function getSurfaceVariantStyle(
  token: AntdToken,
  variant: UIComponentVariant = "default",
): CSSProperties {
  switch (variant) {
    case "filled":
      return {
        background: token.colorBgElevated,
        borderColor: token.colorBorderSecondary,
      };
    case "outlined":
      return {
        background: token.colorBgContainer,
        borderColor: token.colorBorder,
      };
    case "ghost":
      return {
        background: "transparent",
        borderColor: "transparent",
        boxShadow: "none",
      };
    case "default":
    default:
      return {
        background: token.colorBgContainer,
        borderColor: token.colorBorderSecondary,
      };
  }
}

export function getSurfaceStateStyle(state: UIComponentState = "default"): CSSProperties | undefined {
  if (state === "disabled") {
    return {
      opacity: 0.55,
      pointerEvents: "none",
      cursor: "not-allowed",
    };
  }

  if (state === "readonly") {
    return {
      opacity: 0.75,
    };
  }

  return undefined;
}

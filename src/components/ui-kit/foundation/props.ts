import type { AriaRole, CSSProperties } from "react";

export type UIComponentSize = "sm" | "md" | "lg";
export type UIComponentDensity = "compact" | "comfortable" | "spacious";
export type UIComponentVariant = "default" | "filled" | "outlined" | "ghost";
export type UIComponentState =
  | "default"
  | "loading"
  | "disabled"
  | "readonly"
  | "error"
  | "success"
  | "warning";

export type UIResponsiveMode = "inline" | "stack" | "collapse";
export type UIResponsiveBreakpoint = "xs" | "sm" | "md" | "lg" | "xl";
export type UIResponsiveBehavior = Partial<
  Record<UIResponsiveBreakpoint, UIResponsiveMode>
>;

export interface UIKitA11yProps {
  role?: AriaRole;
  tabIndex?: number;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-live"?: "off" | "polite" | "assertive";
}

export interface UIKitCommonProps extends UIKitA11yProps {
  className?: string;
  style?: CSSProperties;
  "data-testid"?: string;
}

export interface UIKitVariantProps {
  size?: UIComponentSize;
  density?: UIComponentDensity;
  variant?: UIComponentVariant;
  state?: UIComponentState;
  responsive?: UIResponsiveBehavior;
}

export type UIKitComponentProps = UIKitCommonProps & UIKitVariantProps;

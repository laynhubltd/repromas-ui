import type { CSSProperties } from "react";
import type { UIComponentDensity, UIComponentSize } from "./props";
import { toAntdSize, toSpacingUnit } from "./tokens";

export type UIKitStyleStrategy = "antd-token" | "antd-prop" | "css-fallback";

export interface UIKitStyleStrategyInput {
  usesAntdToken?: boolean;
  usesAntdProp?: boolean;
  requiresUnsupportedBehavior?: boolean;
}

export const UI_KIT_STYLE_PRIORITY = [
  "antd-token",
  "antd-prop",
  "css-fallback",
] as const;

export function resolveUIKitStyleStrategy(
  input: UIKitStyleStrategyInput,
): UIKitStyleStrategy {
  if (input.requiresUnsupportedBehavior) {
    return "css-fallback";
  }
  if (input.usesAntdToken) {
    return "antd-token";
  }
  if (input.usesAntdProp) {
    return "antd-prop";
  }
  return "antd-token";
}

export function getSharedSpacingStyle(
  density: UIComponentDensity = "comfortable",
): CSSProperties {
  const spacing = toSpacingUnit(density);
  return {
    gap: spacing,
    paddingBlock: spacing,
    paddingInline: spacing,
  };
}

export function getSharedSizeProps(size: UIComponentSize = "md"): {
  size: "small" | "middle" | "large";
} {
  return { size: toAntdSize(size) };
}

export function mergeUIKitStyles(
  ...styles: Array<CSSProperties | undefined>
): CSSProperties | undefined {
  const flattened = styles.filter(Boolean);
  if (flattened.length === 0) {
    return undefined;
  }
  return Object.assign({}, ...flattened);
}

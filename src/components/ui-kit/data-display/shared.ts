import type { CSSProperties } from "react";
import type { UIComponentDensity, UIComponentState } from "../foundation";
import { toSpacingUnit } from "../foundation";

export function getDataDisplaySpacing(density: UIComponentDensity = "comfortable"): number {
  return toSpacingUnit(density);
}

export function getDataDisplayStateStyle(
  state: UIComponentState = "default",
): CSSProperties | undefined {
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

export function buildClassName(...tokens: Array<string | undefined>): string | undefined {
  const merged = tokens.filter((token): token is string => Boolean(token)).join(" ");
  return merged.length > 0 ? merged : undefined;
}

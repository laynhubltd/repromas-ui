import type { CSSProperties } from "react";
import type { UIComponentState } from "./props";

export const UI_KIT_ACCESSIBILITY_BASELINE = {
  keyboard:
    "Interactive elements must be reachable via Tab and activate with Enter/Space where applicable.",
  focusVisible:
    "Visible focus indicators are required and must meet contrast against surrounding surfaces.",
  aria:
    "Interactive and status components must expose role and aria labels/descriptions where needed.",
} as const;

export const UI_KIT_FOCUS_VISIBLE_STYLE: CSSProperties = {
  outline: "2px solid var(--color-primary)",
  outlineOffset: 2,
};

export function isInteractiveStateDisabled(state?: UIComponentState): boolean {
  return state === "disabled" || state === "readonly";
}

export function getInteractiveTabIndex(state?: UIComponentState): number | undefined {
  return isInteractiveStateDisabled(state) ? -1 : undefined;
}

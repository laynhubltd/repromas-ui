import type { CSSProperties } from "react";
import type { ExplainerBadgeVariant, ExplainerIntent } from "./types";

interface IntentMeta {
  color: string;
  bg: string;
  border: string;
  badgeColor: string;
}

/** Static colour tokens per intent — intentionally not derived from Ant token
 *  so they stay legible regardless of the active primary colour. */
export const INTENT_META: Record<ExplainerIntent, IntentMeta> = {
  info: {
    color: "#0958d9",
    bg: "#e6f4ff",
    border: "#91caff",
    badgeColor: "blue",
  },
  tip: {
    color: "#389e0d",
    bg: "#f6ffed",
    border: "#b7eb8f",
    badgeColor: "green",
  },
  warning: {
    color: "#d46b08",
    bg: "#fff7e6",
    border: "#ffd591",
    badgeColor: "orange",
  },
  new: {
    color: "#531dab",
    bg: "#f9f0ff",
    border: "#d3adf7",
    badgeColor: "purple",
  },
  beta: {
    color: "#08979c",
    bg: "#e6fffb",
    border: "#87e8de",
    badgeColor: "cyan",
  },
};

export const BADGE_VARIANT_META: Record<
  ExplainerBadgeVariant,
  { label: string; intent: ExplainerIntent }
> = {
  new: { label: "New", intent: "new" },
  beta: { label: "Beta", intent: "beta" },
  tip: { label: "Tip", intent: "tip" },
  updated: { label: "Updated", intent: "info" },
  soon: { label: "Coming soon", intent: "warning" },
};

export function getCalloutStyle(intent: ExplainerIntent): CSSProperties {
  const meta = INTENT_META[intent];
  return {
    background: meta.bg,
    border: `1px solid ${meta.border}`,
    borderRadius: 8,
    padding: "12px 16px",
  };
}

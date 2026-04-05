import type { ReactNode } from "react";

/** Visual intent of the explainer — maps to a colour and icon set. */
export type ExplainerIntent = "info" | "tip" | "warning" | "new" | "beta";

/** Compact badge label variants. */
export type ExplainerBadgeVariant = "new" | "beta" | "tip" | "updated" | "soon";

/** A single step in a walkthrough sequence. */
export interface ExplainerStep {
  key: string;
  title: ReactNode;
  body: ReactNode;
  /** Optional illustration / icon shown above the title. */
  media?: ReactNode;
}

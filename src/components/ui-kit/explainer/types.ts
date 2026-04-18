import type { ReactNode } from "react";

export type ExplainerVariant = "inline" | "panel" | "empty-state";
export type ExplainerMode = "persistent" | "dismissible";

export interface ExplainerActionLink {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
  target?: string;
  rel?: string;
  ariaLabel?: string;
}

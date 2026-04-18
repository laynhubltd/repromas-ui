import type { ReactNode } from "react";

export type ExplainerVariant = "inline" | "panel" | "empty-state";
export type ExplainerMode = "persistent" | "dismissible";
export type ExplainerIntent = "info" | "tip" | "warning" | "new" | "beta";
export type ExplainerBadgeVariant = "new" | "beta" | "tip" | "updated" | "soon";

export type ExplainerStep = {
  key: string;
  title: ReactNode;
  body?: ReactNode;
  media?: ReactNode;
};

export interface ExplainerActionLink {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
  target?: string;
  rel?: string;
  ariaLabel?: string;
}

import type { PermissionRequirement } from "@/features/access-control/types";
import type { ReactNode } from "react";

export type ConfigTabDefinition = {
  key: string;
  label: string;
  children: ReactNode;
  permission?: PermissionRequirement;
};

export type ConfigTabGroupDefinition = {
  key: string;
  label: string;
  tabs: ConfigTabDefinition[];
  permission?: PermissionRequirement;
};

export type GroupedConfigTabsProps = {
  groups: ConfigTabGroupDefinition[];
  defaultGroupKey?: string;
  defaultTabKey?: string;
  ariaLabel?: string;
  syncWithUrl?: boolean;
  urlGroupParam?: string;
  urlTabParam?: string;
  /** Custom fallback component rendered when zero groups or tabs survive permission filtering */
  emptyFallback?: ReactNode;
};

import type { ReactNode } from "react";

export type ConfigTabDefinition = {
  key: string;
  label: string;
  children: ReactNode;
};

export type ConfigTabGroupDefinition = {
  key: string;
  label: string;
  tabs: ConfigTabDefinition[];
};

export type GroupedConfigTabsProps = {
  groups: ConfigTabGroupDefinition[];
  defaultGroupKey?: string;
  defaultTabKey?: string;
  ariaLabel?: string;
  syncWithUrl?: boolean;
  urlGroupParam?: string;
  urlTabParam?: string;
};

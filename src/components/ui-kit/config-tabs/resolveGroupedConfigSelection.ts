import type { ConfigTabGroupDefinition } from "./types";

type ResolveGroupedConfigSelectionArgs = {
  groups: ConfigTabGroupDefinition[];
  requestedGroup: string | null;
  requestedTab: string | null;
  defaultGroupKey?: string;
  defaultTabKey?: string;
};

export function resolveGroupedConfigSelection({
  groups,
  requestedGroup,
  requestedTab,
  defaultGroupKey,
  defaultTabKey,
}: ResolveGroupedConfigSelectionArgs): { groupKey: string; tabKey: string } {
  if (groups.length === 0) {
    throw new Error("GroupedConfigTabs requires at least one group.");
  }

  const fallbackGroup =
    groups.find((group) => group.key === defaultGroupKey) ?? groups[0];
  const fallbackTab =
    fallbackGroup.tabs.find((tab) => tab.key === defaultTabKey) ??
    fallbackGroup.tabs[0];

  if (!fallbackTab) {
    throw new Error(`Group "${fallbackGroup.key}" has no tabs.`);
  }

  if (requestedGroup) {
    const group = groups.find((item) => item.key === requestedGroup);
    if (group && group.tabs.length > 0) {
      const tab =
        group.tabs.find((item) => item.key === requestedTab) ?? group.tabs[0];
      return { groupKey: group.key, tabKey: tab.key };
    }
  }

  if (requestedTab) {
    for (const group of groups) {
      const tab = group.tabs.find((item) => item.key === requestedTab);
      if (tab) {
        return { groupKey: group.key, tabKey: tab.key };
      }
    }
  }

  return { groupKey: fallbackGroup.key, tabKey: fallbackTab.key };
}

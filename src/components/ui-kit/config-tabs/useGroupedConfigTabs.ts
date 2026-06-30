import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { resolveGroupedConfigSelection } from "./resolveGroupedConfigSelection";
import type { ConfigTabGroupDefinition } from "./types";

type UseGroupedConfigTabsArgs = {
  groups: ConfigTabGroupDefinition[];
  defaultGroupKey?: string;
  defaultTabKey?: string;
  syncWithUrl?: boolean;
  urlGroupParam?: string;
  urlTabParam?: string;
};

export function useGroupedConfigTabs({
  groups,
  defaultGroupKey,
  defaultTabKey,
  syncWithUrl = false,
  urlGroupParam = "group",
  urlTabParam = "tab",
}: UseGroupedConfigTabsArgs) {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSelection = useMemo(
    () =>
      resolveGroupedConfigSelection({
        groups,
        requestedGroup: syncWithUrl ? searchParams.get(urlGroupParam) : null,
        requestedTab: syncWithUrl ? searchParams.get(urlTabParam) : null,
        defaultGroupKey,
        defaultTabKey,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount defaults only
    [],
  );

  const [localSelection, setLocalSelection] = useState(initialSelection);

  const selection = syncWithUrl
    ? resolveGroupedConfigSelection({
        groups,
        requestedGroup: searchParams.get(urlGroupParam),
        requestedTab: searchParams.get(urlTabParam),
        defaultGroupKey,
        defaultTabKey,
      })
    : localSelection;

  const activeGroup =
    groups.find((group) => group.key === selection.groupKey) ?? groups[0];
  const activeTab =
    activeGroup.tabs.find((tab) => tab.key === selection.tabKey) ??
    activeGroup.tabs[0];

  const applySelection = useCallback(
    (groupKey: string, tabKey: string) => {
      if (syncWithUrl) {
        setSearchParams(
          { [urlGroupParam]: groupKey, [urlTabParam]: tabKey },
          { replace: true },
        );
        return;
      }
      setLocalSelection({ groupKey, tabKey });
    },
    [setSearchParams, syncWithUrl, urlGroupParam, urlTabParam],
  );

  const handleGroupChange = useCallback(
    (groupKey: string) => {
      const group = groups.find((item) => item.key === groupKey);
      if (!group || group.tabs.length === 0) return;

      const nextTabKey =
        group.key === selection.groupKey &&
        group.tabs.some((tab) => tab.key === selection.tabKey)
          ? selection.tabKey
          : group.tabs[0].key;

      applySelection(group.key, nextTabKey);
    },
    [applySelection, groups, selection.groupKey, selection.tabKey],
  );

  const handleTabChange = useCallback(
    (tabKey: string) => {
      applySelection(activeGroup.key, tabKey);
    },
    [activeGroup.key, applySelection],
  );

  return {
    activeGroup,
    activeTab,
    activeGroupKey: selection.groupKey,
    activeTabKey: selection.tabKey,
    handleGroupChange,
    handleTabChange,
  };
}

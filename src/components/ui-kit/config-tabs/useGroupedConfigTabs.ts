import { useAccessControl } from "@/features/access-control/use-access-control";
import { filterPermittedGroups } from "@/features/access-control/permitted-tabs";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { resolveGroupedConfigSelection } from "./resolveGroupedConfigSelection";
import type { ConfigTabDefinition, ConfigTabGroupDefinition } from "./types";

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
  const { isPermitted } = useAccessControl();

  // Filter groups and their tabs using the pure headless engine before resolution
  const permittedGroups = useMemo(
    () => filterPermittedGroups(groups, isPermitted),
    [groups, isPermitted],
  );

  const isEmpty = permittedGroups.length === 0;

  const initialSelection = useMemo(
    () => {
      if (permittedGroups.length === 0) {
        return { groupKey: "", tabKey: "" };
      }
      return resolveGroupedConfigSelection({
        groups: permittedGroups,
        requestedGroup: syncWithUrl ? searchParams.get(urlGroupParam) : null,
        requestedTab: syncWithUrl ? searchParams.get(urlTabParam) : null,
        defaultGroupKey,
        defaultTabKey,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount defaults only
    [],
  );

  const [localSelection, setLocalSelection] = useState(initialSelection);

  const selection = useMemo(() => {
    if (permittedGroups.length === 0) {
      return { groupKey: "", tabKey: "" };
    }
    return syncWithUrl
      ? resolveGroupedConfigSelection({
          groups: permittedGroups,
          requestedGroup: searchParams.get(urlGroupParam),
          requestedTab: searchParams.get(urlTabParam),
          defaultGroupKey,
          defaultTabKey,
        })
      : localSelection;
  }, [
    permittedGroups,
    syncWithUrl,
    searchParams,
    urlGroupParam,
    urlTabParam,
    defaultGroupKey,
    defaultTabKey,
    localSelection,
  ]);

  const activeGroup: ConfigTabGroupDefinition | null = useMemo(() => {
    if (permittedGroups.length === 0) return null;
    return (
      permittedGroups.find((group) => group.key === selection.groupKey) ??
      permittedGroups[0]
    );
  }, [permittedGroups, selection.groupKey]);

  const activeTab: ConfigTabDefinition | null = useMemo(() => {
    if (!activeGroup || activeGroup.tabs.length === 0) return null;
    return (
      activeGroup.tabs.find((tab) => tab.key === selection.tabKey) ??
      activeGroup.tabs[0]
    );
  }, [activeGroup, selection.tabKey]);

  const applySelection = useCallback(
    (groupKey: string, tabKey: string) => {
      if (syncWithUrl) {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.set(urlGroupParam, groupKey);
            next.set(urlTabParam, tabKey);
            return next;
          },
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
      const group = permittedGroups.find((item) => item.key === groupKey);
      if (!group || group.tabs.length === 0) return;

      const nextTabKey =
        group.key === selection.groupKey &&
        group.tabs.some((tab) => tab.key === selection.tabKey)
          ? selection.tabKey
          : group.tabs[0].key;

      applySelection(group.key, nextTabKey);
    },
    [applySelection, permittedGroups, selection.groupKey, selection.tabKey],
  );

  const handleTabChange = useCallback(
    (tabKey: string) => {
      if (!activeGroup) return;
      applySelection(activeGroup.key, tabKey);
    },
    [activeGroup, applySelection],
  );

  return {
    permittedGroups,
    isEmpty,
    activeGroup,
    activeTab,
    activeGroupKey: selection.groupKey,
    activeTabKey: selection.tabKey,
    handleGroupChange,
    handleTabChange,
  };
}

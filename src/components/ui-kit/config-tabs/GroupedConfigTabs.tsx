import { useToken } from "@/shared/hooks/useToken";
import { Flex } from "antd";
import type { CSSProperties } from "react";
import { PrimarySegmented } from "../tabs/PrimarySegmented";
import { Tabs } from "../tabs/Tabs";
import type { GroupedConfigTabsProps } from "./types";
import { useGroupedConfigTabs } from "./useGroupedConfigTabs";

export function GroupedConfigTabs({
  groups,
  defaultGroupKey,
  defaultTabKey,
  ariaLabel = "Configuration navigation",
  syncWithUrl = true,
  urlGroupParam,
  urlTabParam,
}: GroupedConfigTabsProps) {
  const token = useToken();
  const {
    activeGroup,
    activeTab,
    activeGroupKey,
    activeTabKey,
    handleGroupChange,
    handleTabChange,
  } = useGroupedConfigTabs({
    groups,
    defaultGroupKey,
    defaultTabKey,
    syncWithUrl,
    urlGroupParam,
    urlTabParam,
  });

  const segmentOptions = groups.map((group) => ({
    label: group.label,
    value: group.key,
  }));

  const subTabItems = activeGroup.tabs.map((tab) => ({
    key: tab.key,
    label: tab.label,
  }));

  return (
    <Flex vertical gap={token.marginLG} style={{ width: "100%" }}>
      <PrimarySegmented
        block
        value={activeGroupKey}
        options={segmentOptions}
        onChange={(value) => handleGroupChange(String(value))}
        aria-label={`${ariaLabel} groups`}
      />

      {activeGroup.tabs.length > 1 && (
        <Tabs
          items={subTabItems}
          activeKey={activeTabKey}
          onChange={handleTabChange}
          size="md"
          density="comfortable"
          variant="outlined"
          className="ui-kit-tabs--primary-active"
          style={
            {
              "--tabs-primary-active-bg": token.colorPrimary,
              "--tabs-primary-active-fg": token.colorTextLightSolid,
            } as CSSProperties
          }
          aria-label={`${ariaLabel} sections`}
        />
      )}

      <div key={`${activeGroupKey}:${activeTabKey}`}>{activeTab.children}</div>
    </Flex>
  );
}

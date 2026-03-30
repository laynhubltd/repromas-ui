import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import {
  AuditOutlined,
  BarChartOutlined,
  BookOutlined,
  GlobalOutlined,
  LinkOutlined,
  NumberOutlined,
} from "@ant-design/icons";
import { Tabs } from "antd";
import {
  GeographyRuleTab,
  OLevelGradingTab,
  OLevelTab,
  ProgramCutoffTab,
  ProgramOLevelTab,
  ProgramQuotaTab,
} from "./components";

const SUB_TAB_KEYS = {
  geography: "geography-rule",
  programQuota: "program-quota",
  programCutoff: "program-cutoff",
  oLevel: "o-level",
  programOLevel: "program-o-level",
  oLevelGrading: "o-level-grading",
} as const;

export function AdmissionConfigTab() {
  const isMobile = useIsMobile();
  const token = useToken();

  const tabItems = [
    {
      key: SUB_TAB_KEYS.geography,
      label: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <GlobalOutlined />
          Geography rule
        </span>
      ),
      children: (
        <div style={{ padding: isMobile ? 16 : 32 }}>
          <GeographyRuleTab />
        </div>
      ),
    },
    {
      key: SUB_TAB_KEYS.programQuota,
      label: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <NumberOutlined />
          Program quota
        </span>
      ),
      children: (
        <div style={{ padding: isMobile ? 16 : 32 }}>
          <ProgramQuotaTab />
        </div>
      ),
    },
    {
      key: SUB_TAB_KEYS.programCutoff,
      label: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <BarChartOutlined />
          Program cutoff
        </span>
      ),
      children: (
        <div style={{ padding: isMobile ? 16 : 32 }}>
          <ProgramCutoffTab />
        </div>
      ),
    },
    {
      key: SUB_TAB_KEYS.oLevel,
      label: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <BookOutlined />
          O&apos;Level
        </span>
      ),
      children: (
        <div style={{ padding: isMobile ? 16 : 32 }}>
          <OLevelTab />
        </div>
      ),
    },
    {
      key: SUB_TAB_KEYS.programOLevel,
      label: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <LinkOutlined />
          Program O&apos;Level
        </span>
      ),
      children: (
        <div style={{ padding: isMobile ? 16 : 32 }}>
          <ProgramOLevelTab />
        </div>
      ),
    },
    {
      key: SUB_TAB_KEYS.oLevelGrading,
      label: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <AuditOutlined />
          O&apos;Level Grading
        </span>
      ),
      children: (
        <div style={{ padding: isMobile ? 16 : 32 }}>
          <OLevelGradingTab />
        </div>
      ),
    },
  ];

  return (
    <Tabs
      tabPosition={isMobile ? "top" : "left"}
      size="small"
      items={tabItems}
      tabBarGutter={8}
      style={{ minHeight: 560, paddingTop: `${token.sizeXS}px` }}
    />
  );
}

import { Tabs } from "@/components/ui-kit";
import { useIsMobile } from "@/hooks/useBreakpoint";
import {
    AuditOutlined,
    BarChartOutlined,
    BookOutlined,
    GlobalOutlined,
    LinkOutlined,
    NumberOutlined,
} from "@ant-design/icons";
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

  return (
    <Tabs
      tabPosition={isMobile ? "top" : "left"}
      size="sm"
      density="compact"
      variant="default"
      style={{ minHeight: 560 }}
      aria-label="Admission configuration sections"
      items={[
        {
          key: SUB_TAB_KEYS.geography,
          label: "Geography rule",
          icon: <GlobalOutlined />,
          children: (
            <div style={{ padding: isMobile ? 16 : 32 }}>
              <GeographyRuleTab />
            </div>
          ),
        },
        {
          key: SUB_TAB_KEYS.programQuota,
          label: "Program quota",
          icon: <NumberOutlined />,
          children: (
            <div style={{ padding: isMobile ? 16 : 32 }}>
              <ProgramQuotaTab />
            </div>
          ),
        },
        {
          key: SUB_TAB_KEYS.programCutoff,
          label: "Program cutoff",
          icon: <BarChartOutlined />,
          children: (
            <div style={{ padding: isMobile ? 16 : 32 }}>
              <ProgramCutoffTab />
            </div>
          ),
        },
        {
          key: SUB_TAB_KEYS.oLevel,
          label: "O'Level",
          icon: <BookOutlined />,
          children: (
            <div style={{ padding: isMobile ? 16 : 32 }}>
              <OLevelTab />
            </div>
          ),
        },
        {
          key: SUB_TAB_KEYS.programOLevel,
          label: "Program O'Level",
          icon: <LinkOutlined />,
          children: (
            <div style={{ padding: isMobile ? 16 : 32 }}>
              <ProgramOLevelTab />
            </div>
          ),
        },
        {
          key: SUB_TAB_KEYS.oLevelGrading,
          label: "O'Level Grading",
          icon: <AuditOutlined />,
          children: (
            <div style={{ padding: isMobile ? 16 : 32 }}>
              <OLevelGradingTab />
            </div>
          ),
        },
      ]}
    />
  );
}

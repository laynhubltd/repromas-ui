// Feature: grading-config
import { GroupedConfigTabs } from "@/components/ui-kit";
import { GRADING_CONFIG_TAB_GROUPS } from "../gradingConfigTabRegistry";

export function GradingConfigPage() {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <GroupedConfigTabs
        groups={GRADING_CONFIG_TAB_GROUPS}
        defaultGroupKey="grading-system"
        defaultTabKey="grading-systems"
        ariaLabel="Grading configuration navigation"
        syncWithUrl
      />
    </div>
  );
}

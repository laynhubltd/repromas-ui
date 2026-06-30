// Feature: admission-config
// Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3, 3.4

import { GroupedConfigTabs } from "@/components/ui-kit";
import { ADMISSION_CONFIG_TAB_GROUPS } from "../admissionConfigTabRegistry";

export function AdmissionConfigPage() {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <GroupedConfigTabs
        groups={ADMISSION_CONFIG_TAB_GROUPS}
        defaultGroupKey="foundation"
        defaultTabKey="admission-cycle"
        aria-label="Admission configuration navigation"
        syncWithUrl
      />
    </div>
  );
}

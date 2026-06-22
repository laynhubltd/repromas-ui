// Feature: admission-config
// Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3, 3.4

import { Tabs } from "@/components/ui-kit";
import { AdmissionCycleTab } from "../tabs/admission-cycle";
import { DocumentTypeTab } from "../tabs/document-type";
import { DynamicFormsTab } from "../tabs/dynamic-forms";
import { GeographyRuleTab } from "../tabs/geography-rule";
import { JambRuleTab } from "../tabs/jamb-rule";
import { OlevelGradePointTab } from "../tabs/olevel-grade-point";
import { OlevelSubjectTab } from "../tabs/olevel-subject";
import { ProgramAdmissionConfigTab } from "../tabs/program-admission-config";
import { ProgramOlevelRuleTab } from "../tabs/program-olevel-rule";
import { ScoringStrategyTab } from "../tabs/scoring-strategy";

/**
 * AdmissionConfigPage — top-level page for admission configuration.
 *
 * Mirrors GradingConfigPage exactly: renders a Tabs component with sub-feature tabs.
 * Currently hosts the Scoring Strategy tab.
 *
 * Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3, 3.4
 */
export function AdmissionConfigPage() {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <Tabs
        items={[
          {
            key: "admission-cycle",
            label: "Admission Cycle",
            children: <AdmissionCycleTab />,
          },
          {
            key: "geography-rule",
            label: "Geography Rule",
            children: <GeographyRuleTab />,
          },
          {
            key: "olevel-subject",
            label: "O'Level Subjects",
            children: <OlevelSubjectTab />,
          },
          {
            key: "olevel-grade-point",
            label: "O'Level Grading",
            children: <OlevelGradePointTab />,
          },
          {
            key: "program-olevel-rule",
            label: "Program O'Level Rules",
            children: <ProgramOlevelRuleTab />,
          },
          {
            key: "admission-cutoff-quota",
            label: "Admission Cut-offs/Quota",
            children: <ProgramAdmissionConfigTab />,
          },
          {
            key: "jamb-rule",
            label: "JAMB Rule",
            children: <JambRuleTab />,
          },
          {
            key: "scoring-strategy",
            label: "Scoring Strategy",
            children: <ScoringStrategyTab />,
          },
          {
            key: "document-type",
            label: "Document Types",
            children: <DocumentTypeTab />,
          },
          {
            key: "dynamic-forms",
            label: "Form Builder",
            children: <DynamicFormsTab />,
          },
        ]}
        defaultActiveKey="admission-cycle"
        size="md"
        density="spacious"
        variant="default"
        aria-label="Admission configuration navigation"
      />
    </div>
  );
}

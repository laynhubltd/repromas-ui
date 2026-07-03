import type { ConfigTabGroupDefinition } from "@/components/ui-kit";
import { AdmissionCycleTab } from "./tabs/admission-cycle";
import { MatricNumberFormatTab } from "./tabs/matric-number-format";
import { DocumentTypeTab } from "./tabs/document-type";
import { DynamicFormsTab } from "./tabs/dynamic-forms";
import { GeographyRuleTab } from "./tabs/geography-rule";
import { JambRuleTab } from "./tabs/jamb-rule";
import { OlevelGradePointTab } from "./tabs/olevel-grade-point";
import { OlevelSubjectTab } from "./tabs/olevel-subject";
import { ProgramAdmissionConfigTab } from "./tabs/program-admission-config";
import { ProgramOlevelRuleTab } from "./tabs/program-olevel-rule";
import { ProgramPriorQualRequirementTab } from "./tabs/program-prior-qualification-requirement";
import { QualificationTypeTab } from "./tabs/qualification-type";
import { ScoringStrategyTab } from "./tabs/scoring-strategy";

export const ADMISSION_CONFIG_TAB_GROUPS: ConfigTabGroupDefinition[] = [
  {
    key: "foundation",
    label: "Foundation",
    tabs: [
      {
        key: "admission-cycle",
        label: "Admission Cycle",
        children: <AdmissionCycleTab />,
      },
      {
        key: "matric-number-format",
        label: "Matric Number Format",
        children: <MatricNumberFormatTab />,
      },
    ],
  },
  {
    key: "qualifications",
    label: "Qualifications",
    tabs: [
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
        key: "qualification-type",
        label: "Qualification Types",
        children: <QualificationTypeTab />,
      },
    ],
  },
  {
    key: "program-rules",
    label: "Program rules",
    tabs: [
      {
        key: "program-olevel-rule",
        label: "O'Level Rules",
        children: <ProgramOlevelRuleTab />,
      },
      {
        key: "program-prior-qualification",
        label: "Prior Qual Rules",
        children: <ProgramPriorQualRequirementTab />,
      },
      {
        key: "admission-cutoff-quota",
        label: "Cut-offs & Quota",
        children: <ProgramAdmissionConfigTab />,
      },
      {
        key: "geography-rule",
        label: "Geography Rule",
        children: <GeographyRuleTab />,
      },
      {
        key: "jamb-rule",
        label: "JAMB Rule",
        children: <JambRuleTab />,
      },
    ],
  },
  {
    key: "screening",
    label: "Screening",
    tabs: [
      {
        key: "scoring-strategy",
        label: "Scoring Strategy",
        children: <ScoringStrategyTab />,
      },
    ],
  },
  {
    key: "application",
    label: "Application",
    tabs: [
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
    ],
  },
];

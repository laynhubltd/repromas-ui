import type { ConfigTabGroupDefinition } from "@/components/ui-kit";
import { Permission } from "@/features/access-control/permissions";
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
        permission: [
          Permission.AdmissionCyclesList,
          Permission.AdmissionCyclesManage,
        ],
      },
      {
        key: "matric-number-format",
        label: "Matric Number Format",
        children: <MatricNumberFormatTab />,
        permission: [
          Permission.MatricNumberFormatsList,
          Permission.MatricNumberFormatsManage,
        ],
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
        permission: [
          Permission.OlevelSubjectsList,
          Permission.OlevelSubjectsManage,
        ],
      },
      {
        key: "olevel-grade-point",
        label: "O'Level Grading",
        children: <OlevelGradePointTab />,
        permission: [
          Permission.OlevelGradePointsList,
          Permission.OlevelGradePointsManage,
        ],
      },
      {
        key: "qualification-type",
        label: "Qualification Types",
        children: <QualificationTypeTab />,
        permission: [
          Permission.PriorQualificationTypesList,
          Permission.PriorQualificationTypesManage,
        ],
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
        permission: [
          Permission.ProgramOlevelRequirementsList,
          Permission.ProgramOlevelRequirementsManage,
        ],
      },
      {
        key: "program-prior-qualification",
        label: "Prior Qual Rules",
        children: <ProgramPriorQualRequirementTab />,
        permission: [
          Permission.ProgramPriorQualificationRequirementsList,
          Permission.ProgramPriorQualificationRequirementsManage,
        ],
      },
      {
        key: "admission-cutoff-quota",
        label: "Cut-offs & Quota",
        children: <ProgramAdmissionConfigTab />,
        permission: [
          Permission.ProgramAdmissionConfigsList,
          Permission.ProgramAdmissionConfigsManage,
        ],
      },
      {
        key: "geography-rule",
        label: "Geography Rule",
        children: <GeographyRuleTab />,
        permission: [
          Permission.AdmissionGeographyRulesList,
          Permission.AdmissionGeographyRulesManage,
        ],
      },
      {
        key: "jamb-rule",
        label: "JAMB Rule",
        children: <JambRuleTab />,
        permission: [
          Permission.JambCombinationGroupsList,
          Permission.JambCombinationOptionsList,
          Permission.JambSubjectCombinationsList,
          Permission.JambCombinationGroupsManage,
        ],
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
        permission: [
          Permission.PostUtmeScoresList,
          Permission.PostUtmeScoresManage,
          Permission.AdmissionScreeningsList,
        ],
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
        permission: [
          Permission.AdmissionDocumentTypesList,
          Permission.AdmissionDocumentTypesManage,
        ],
      },
      {
        key: "dynamic-forms",
        label: "Form Builder",
        children: <DynamicFormsTab />,
        permission: [
          Permission.DynamicFormsList,
          Permission.DynamicFormAssignmentsList,
          Permission.DynamicFormsManage,
        ],
      },
    ],
  },
];

import type { ConfigTabGroupDefinition } from "@/components/ui-kit";
import { Permission } from "@/features/access-control/permissions";
import { AcademicStandingTab } from "./tabs/academic-standing";
import { AcademicStandingBoundaryTab } from "./tabs/academic-standing-boundary";
import { AcademicStandingDegreeClassificationTab } from "./tabs/academic-standing-degree-classification";
import { AcademicStandingEscalationTab } from "./tabs/academic-standing-escalation";
import { EvaluationStatusTab } from "./tabs/evaluation-status";
import { GradingSystemTab } from "./tabs/grading-system";
import { GradingSystemBoundaryTab } from "./tabs/grading-system-boundary";

export const GRADING_CONFIG_TAB_GROUPS: ConfigTabGroupDefinition[] = [
  {
    key: "grading-system",
    label: "Grading System",
    tabs: [
      {
        key: "grading-systems",
        label: "Grading Systems",
        children: <GradingSystemTab />,
        permission: [
          Permission.GradingSchemaConfigsList,
          Permission.GradingList,
          Permission.GradingSchemaConfigsManage,
        ],
      },
      {
        key: "grading-boundaries",
        label: "Grade Boundaries",
        children: <GradingSystemBoundaryTab />,
        permission: [
          Permission.GradingSchemaConfigsList,
          Permission.GradingList,
          Permission.GradingSchemaConfigsManage,
        ],
      },
      {
        key: "evaluation-status",
        label: "Evaluation Status",
        children: <EvaluationStatusTab />,
        permission: [
          Permission.ScoreEvaluationStatusesList,
          Permission.GradingList,
          Permission.GradingManage,
        ],
      },
    ],
  },
  {
    key: "academic-standing",
    label: "Academic Standing",
    tabs: [
      {
        key: "standing-policies",
        label: "Standing Policies",
        children: <AcademicStandingTab />,
        permission: [
          Permission.AcademicStandingsList,
          Permission.AcademicStandingsManage,
        ],
      },
      {
        key: "cgpa-boundaries",
        label: "CGPA Boundaries",
        children: <AcademicStandingBoundaryTab />,
        permission: [
          Permission.AcademicStandingBoundariesList,
          Permission.AcademicStandingBoundariesManage,
        ],
      },
      {
        key: "degree-classifications",
        label: "Degree Classifications",
        children: <AcademicStandingDegreeClassificationTab />,
        permission: [
          Permission.AcademicStandingDegreeClassificationsList,
          Permission.AcademicStandingDegreeClassificationsManage,
        ],
      },
      {
        key: "escalation-ladders",
        label: "Escalation Ladders",
        children: <AcademicStandingEscalationTab />,
        permission: [
          Permission.AcademicStandingEscalationStepsList,
          Permission.AcademicStandingEscalationStepsManage,
        ],
      },
    ],
  },
];

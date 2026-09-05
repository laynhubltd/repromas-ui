import type { ConfigTabGroupDefinition } from "@/components/ui-kit";
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
      },
      {
        key: "grading-boundaries",
        label: "Grade Boundaries",
        children: <GradingSystemBoundaryTab />,
      },
      {
        key: "evaluation-status",
        label: "Evaluation Status",
        children: <EvaluationStatusTab />,
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
      },
      {
        key: "cgpa-boundaries",
        label: "CGPA Boundaries",
        children: <AcademicStandingBoundaryTab />,
      },
      {
        key: "degree-classifications",
        label: "Degree Classifications",
        children: <AcademicStandingDegreeClassificationTab />,
      },
      {
        key: "escalation-ladders",
        label: "Escalation Ladders",
        children: <AcademicStandingEscalationTab />,
      },
    ],
  },
];

// Feature: grading-config
import { ExplainerCallout } from "@/components/ui-kit";
import type { ReactElement } from "react";

/**
 * EvaluationStatusBanner — pure presentational component.
 * Renders an ExplainerCallout explaining what Evaluation Statuses are
 * and how the four behavioral flags affect grading, GPA, credit, and retake requirements.
 */
export function EvaluationStatusBanner(): ReactElement {
  return (
    <ExplainerCallout
      intent="info"
      collapsible
      title="Evaluation Statuses"
      body="Evaluation Statuses classify how a student's score sheet is treated academically. Each status carries four behavioral flags: Standard Graded (whether a letter grade is computed), Counts in GPA (whether the result factors into the student's GPA), Earns Credit (whether the student earns academic credit), and Retake Required (whether the student must retake the course). Exactly one status per institution must be marked as the default."
    />
  );
}

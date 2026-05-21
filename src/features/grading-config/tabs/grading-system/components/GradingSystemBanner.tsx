// Feature: grading-config
import { ExplainerCallout } from "@/components/ui-kit";
import type { ReactElement } from "react";

/**
 * GradingSystemBanner — pure presentational component.
 * Renders an ExplainerCallout explaining what Grading Systems are,
 * why they matter, and how to create and manage them.
 */
export function GradingSystemBanner(): ReactElement {
  return (
    <ExplainerCallout
      intent="info"
      collapsible
      title="Grading Systems"
      body="Grading Systems define the named grading scales used across your institution. Each system specifies a scope (Global, Faculty, Department, or Program), an optional GPA scale with a maximum CGPA, and an optional reference entity. Create a grading system first, then add grade boundaries to define the full letter-grade scale."
    />
  );
}

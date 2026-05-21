import { ExplainerCallout } from "@/components/ui-kit";
import type { ReactElement } from "react";

export function JambRuleBanner(): ReactElement {
  return (
    <ExplainerCallout
      intent="info"
      collapsible
      title="JAMB Subject Combinations"
      body="Define UTME subject requirements scoped to Global, Faculty, Department, or Program. At screening, the engine picks the matching rule with the highest priority weight (Program → Department → Faculty → Global). Build each rule as groups: Compulsory (all subjects required) or Any Of (pick N from listed subjects)."
    />
  );
}

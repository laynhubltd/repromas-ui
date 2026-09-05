import { ExplainerCallout } from "@/components/ui-kit";
import type { ReactElement } from "react";

export function TransitionExplainerCallout(): ReactElement {
  return (
    <ExplainerCallout
      intent="info"
      collapsible
      title="Senate Academic Standing & Student Transitions"
      body="This workflow evaluates cohort academic performance against configured Academic Standing policies, CGPA boundaries, and participation rules. Review recommended student transitions, stage administrative manual overrides across pages, execute dry-run simulation checks, and commit approved transition records stamped with your Senate Approval Reference (Memo number)."
    />
  );
}

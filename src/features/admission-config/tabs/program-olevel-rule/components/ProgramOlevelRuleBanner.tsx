import { ExplainerCallout } from "@/components/ui-kit";
import type { ReactElement } from "react";

export function ProgramOlevelRuleBanner(): ReactElement {
  return (
    <ExplainerCallout
      intent="info"
      collapsible
      title="Program O'Level Requirements"
      body="Define compulsory O'Level subjects for each admitting program. Add one subject at a time per program. Candidates must have grades in these subjects during screening and CAPS upload. Configure your O'Level subject catalog first."
    />
  );
}

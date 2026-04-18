import { ExplainerCallout } from "@/components/ui-kit";
import type { ReactElement } from "react";

export function CurriculumVersionBanner(): ReactElement {
  return (
    <ExplainerCallout
      intent="info"
      collapsible
      title="Curriculum Versions"
      body="Curriculum versions define the academic standard used for student admissions. Only one version may be active at a time."
    />
  );
}

import { ExplainerCallout } from "@/components/ui-kit";
import type { ReactElement } from "react";

export function CurriculumVersionBanner(): ReactElement {
  return (
    <ExplainerCallout
      intent="info"
      collapsible
      title="Curriculum Versions & Standards"
      body="Curriculum versions represent regulatory standards, handbooks, and course structures. You can define Global baseline standards or branch custom standards tailored to specific academic programs. Each program can have its own active version for student admissions alongside the institutional baseline."
    />
  );
}


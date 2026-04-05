import { ExplainerCallout } from "@/components/ui-kit";

export function CurriculumVersionBanner(): JSX.Element {
  return (
    <ExplainerCallout
      intent="info"
      collapsible
      title="Curriculum Versions"
      body="Curriculum versions define the academic standard used for student admissions. Only one version may be active at a time."
    />
  );
}

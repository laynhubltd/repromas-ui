import { ExplainerCallout } from "@/components/ui-kit";

export function BroadsheetExplainer() {
  return (
    <ExplainerCallout
      intent="info"
      collapsible
      title="Result Broadsheet Viewer"
      body="The official cohort result broadsheet compiles semester course performance, grade points, cumulative GPAs, academic standing classifications, and summary statistics in accordance with institution assessment policies."
    />
  );
}

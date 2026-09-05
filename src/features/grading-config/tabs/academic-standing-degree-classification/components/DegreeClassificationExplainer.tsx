import { ExplainerCallout } from "@/components/ui-kit";

export function DegreeClassificationExplainer() {
  return (
    <ExplainerCallout
      intent="info"
      collapsible
      title="Degree Classification & Graduation Honors"
      body="Degree Classification Bands define the honors and classification tiers (e.g., First Class, Distinction, Upper Credit, Pass) awarded to graduating students on broadsheets and transcripts. Configured bands automatically inherit the selected Academic Standing policy's scale and 16-priority scoping cascade. If a policy has custom bands, all graduating students are strictly evaluated against those bands; unmatched students receive 'Unclassified'. When zero custom bands are defined, standard national benchmark tables apply."
    />
  );
}

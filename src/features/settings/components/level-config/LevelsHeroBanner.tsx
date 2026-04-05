import { ExplainerCallout } from "@/components/ui-kit";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { useState } from "react";

export function LevelsHeroBanner() {
  const isMobile = useIsMobile();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <ExplainerCallout
      intent="new"
      size={isMobile ? "sm" : "md"}
      title="Levels"
      body="Academic levels define progression order for students. Use rank order to control how students advance between levels each academic year."
      dismissible
      collapsible
      onDismiss={() => setDismissed(true)}
      aria-label="Levels section description"
    />
  );
}

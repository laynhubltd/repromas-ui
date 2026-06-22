import type { LifecycleStepStatus } from "../utils/applicationDossierDisplay";
import { APPLICATION_LIFECYCLE_STEPS } from "../utils/applicationDossierDisplay";
import { Steps } from "antd";
import { useIsMobile } from "@/hooks/useBreakpoint";

type ApplicationLifecycleStepsProps = {
  currentStepIndex: number;
  stepStatuses: LifecycleStepStatus[];
};

export function ApplicationLifecycleSteps({
  currentStepIndex,
  stepStatuses,
}: ApplicationLifecycleStepsProps) {
  const isMobile = useIsMobile();

  return (
    <Steps
      current={currentStepIndex}
      orientation={isMobile ? "vertical" : "horizontal"}
      size="small"
      items={APPLICATION_LIFECYCLE_STEPS.map((step, index) => ({
        title: step.title,
        status: stepStatuses[index],
      }))}
    />
  );
}

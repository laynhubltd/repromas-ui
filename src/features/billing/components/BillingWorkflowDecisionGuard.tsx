import { BILLING_WORKFLOW_UI_COPY } from "@/shared/constants/billingWorkflowOptions";
import type { WorkflowStep } from "@/shared/constants/billingWorkflowOptions";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Flex } from "antd";
import type { ReactNode } from "react";
import { useBillingWorkflowDecisionGuard } from "../hooks/useBillingWorkflowDecisionGuard";
import type { WorkflowPayNowPayload } from "../types/workflow-step-decision";
import { BillingWorkflowBlockingBanner } from "./BillingWorkflowBlockingBanner";

export type BillingWorkflowDecisionGuardProps = {
  workflowStep: WorkflowStep;
  eventCode?: string;
  skip?: boolean;
  children: ReactNode;
  onPayNow?: (payload: WorkflowPayNowPayload) => void;
  showBanner?: boolean;
};

export function BillingWorkflowDecisionGuard({
  workflowStep,
  eventCode,
  skip = false,
  children,
  onPayNow,
  showBanner = true,
}: BillingWorkflowDecisionGuardProps) {
  const { state, actions, flags } = useBillingWorkflowDecisionGuard(
    workflowStep,
    { eventCode, skip, onPayNow },
  );

  if (flags.skip) {
    return <>{children}</>;
  }

  if (state.sectionError) {
    return (
      <ErrorAlert
        variant="section"
        error={state.sectionError ?? BILLING_WORKFLOW_UI_COPY.loadDecisionError}
        onRetry={actions.handleRetry}
      />
    );
  }

  return (
    <DataLoader loading={state.isLoading} minHeight="48px">
      <Flex vertical gap={16} style={{ width: "100%" }}>
        <ConditionalRenderer when={flags.showBlockedUi && showBanner}>
          <BillingWorkflowBlockingBanner
            blockingUi={state.blockingUi}
            onPayNow={actions.handlePayNow}
            onRetry={actions.handleRetry}
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={flags.showWorkflowAction}>
          <Flex justify="flex-end" style={{ width: "100%" }}>
            {children}
          </Flex>
        </ConditionalRenderer>
      </Flex>
    </DataLoader>
  );
}

import type { WorkflowStep } from "@/shared/constants/billingWorkflowOptions";
import { useCallback } from "react";
import type { WorkflowPayNowPayload } from "../types/workflow-step-decision";
import { useBillingWorkflowDecision } from "./useBillingWorkflowDecision";

type UseBillingWorkflowDecisionGuardOptions = {
  eventCode?: string;
  skip?: boolean;
  onPayNow?: (payload: WorkflowPayNowPayload) => void | Promise<void>;
  isPayNowLoading?: boolean;
};

export function useBillingWorkflowDecisionGuard(
  workflowStep: WorkflowStep,
  options: UseBillingWorkflowDecisionGuardOptions = {},
) {
  const { eventCode, skip = false, onPayNow, isPayNowLoading = false } = options;

  const { state, actions, flags } = useBillingWorkflowDecision(workflowStep, {
    eventCode,
    skip,
  });

  const handlePayNow = useCallback(async () => {
    if (isPayNowLoading) return;

    const { primaryItem, canPayNow } = state.blockingUi;
    if (!canPayNow || !primaryItem || primaryItem.feeChargeId === null) {
      return;
    }

    await onPayNow?.({
      feeChargeId: primaryItem.feeChargeId,
      eventCode: primaryItem.eventCode,
      amountOutstandingRequired: primaryItem.amountOutstandingRequired,
    });
  }, [isPayNowLoading, onPayNow, state.blockingUi]);

  const handleRetry = useCallback(() => {
    void actions.refetch();
  }, [actions]);

  return {
    state: {
      blockingUi: state.blockingUi,
      isLoading: state.isLoading,
      sectionError: state.sectionError,
    },
    actions: {
      handlePayNow,
      handleRetry,
      refetch: actions.refetch,
    },
    flags: {
      allowed: flags.allowed,
      skip: flags.skip,
      isBlocked: flags.isBlocked,
      isPreparingFee: flags.isPreparingFee,
      isPayNowLoading,
      showBlockedUi: !flags.skip && !state.isLoading && !state.sectionError && !flags.allowed,
      showWorkflowAction: flags.skip || (!state.isLoading && !state.sectionError && flags.allowed),
    },
  };
}

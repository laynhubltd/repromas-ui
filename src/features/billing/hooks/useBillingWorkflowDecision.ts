import { useGetWorkflowStepDecisionQuery } from "@/features/billing/api/billingWorkflowApi";
import type { WorkflowStep } from "@/shared/constants/billingWorkflowOptions";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { RequestScreen } from "@/shared/types/error-ui";
import { useMemo } from "react";
import {
  getBlockingItems,
  resolveWorkflowBlockingUi,
} from "../utils/workflowStepDecisionDisplay";

type UseBillingWorkflowDecisionOptions = {
  eventCode?: string;
  skip?: boolean;
};

export function useBillingWorkflowDecision(
  workflowStep: WorkflowStep,
  options: UseBillingWorkflowDecisionOptions = {},
) {
  const { eventCode, skip = false } = options;

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetWorkflowStepDecisionQuery(
    { workflowStep, eventCode },
    { skip },
  );

  const sectionError = useMemo(
    () =>
      skip
        ? null
        : deriveSectionErrorMessage(isError, error, {
            screen: RequestScreen.Action,
            method: "GET",
          }),
    [skip, isError, error],
  );

  const blockingItems = useMemo(() => getBlockingItems(data), [data]);
  const blockingUi = useMemo(() => resolveWorkflowBlockingUi(data), [data]);

  const allowed = skip ? true : (data?.allowed ?? false);
  const isBlocked = !skip && !isLoading && !sectionError && !allowed;
  const isPreparingFee = blockingUi.variant === "preparing";

  return {
    state: {
      data,
      blockingItems,
      blockingUi,
      isLoading: skip ? false : isLoading || isFetching,
      sectionError,
    },
    actions: {
      refetch,
    },
    flags: {
      allowed,
      skip,
      isBlocked,
      isPreparingFee,
    },
  };
}

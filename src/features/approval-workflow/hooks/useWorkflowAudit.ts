// Feature: approval-workflow
import { useGetWorkflowAuditHistoryQuery } from "../api/approvalWorkflowApi";
import type { WorkflowTargetEntity } from "../types/approval-workflow";

type UseWorkflowAuditOptions = {
  targetEntity: WorkflowTargetEntity;
  targetId: number;
  open?: boolean;
};

export function useWorkflowAudit({
  targetEntity,
  targetId,
  open = true,
}: UseWorkflowAuditOptions) {
  const {
    data: history = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetWorkflowAuditHistoryQuery(
    { targetEntity, targetId },
    { skip: !targetId || !open },
  );

  return {
    state: {
      history,
      isLoading,
      isFetching,
      isError,
      error,
    },
    actions: {
      refetch,
    },
  };
}

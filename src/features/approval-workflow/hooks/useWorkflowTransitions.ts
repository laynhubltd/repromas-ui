// Feature: approval-workflow
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { notification } from "antd";
import { useCallback, useReducer } from "react";
import {
  useExecuteTransitionMutation,
  useGetAvailableTransitionsQuery,
} from "../api/approvalWorkflowApi";
import type { ApiTagLiteral } from "@/shared/types/apiTagTypes";
import {
  initialWorkflowTransitionState,
  WorkflowTransitionActionType,
  workflowTransitionReducer,
} from "../state/workflowTransitionState";
import type {
  WorkflowTargetEntity,
  WorkflowTransitionDto,
} from "../types/approval-workflow";
import { parseSubmissionPreconditionError } from "../utils/parseSubmissionPrecondition";

type UseWorkflowTransitionsOptions = {
  targetEntity: WorkflowTargetEntity;
  targetId: number;
  targetTag?: ApiTagLiteral;
};

export function useWorkflowTransitions({
  targetEntity,
  targetId,
  targetTag,
}: UseWorkflowTransitionsOptions) {
  const [state, dispatch] = useReducer(
    workflowTransitionReducer,
    initialWorkflowTransitionState,
  );
  const handleApiError = useApiError();

  const {
    data: availableTransitions,
    isLoading,
    isFetching,
    refetch,
  } = useGetAvailableTransitionsQuery(
    { targetEntity, targetId },
    { skip: !targetId },
  );

  const [executeTransitionMutation, { isLoading: isExecuting }] =
    useExecuteTransitionMutation();

  const pollPendingEffects = useCallback(async () => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const backoffMs = attempt * 750;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
      try {
        await refetch().unwrap();
        break;
      } catch {
        // retry next attempt
      }
    }
    dispatch({ type: WorkflowTransitionActionType.ClearPropagating });
  }, [refetch]);

  const execute = useCallback(
    async (transition: WorkflowTransitionDto, commentText?: string) => {
      try {
        const transId = transition.transitionId ?? transition.id ?? 0;
        const result = await executeTransitionMutation({
          targetEntity,
          targetId,
          transitionId: transId,
          comment: commentText,
          targetTag,
        }).unwrap();

        notifyMutationSuccess(
          `${transition.actionName || transition.actionLabel || transition.name || "Action"} completed successfully.`,
        );

        dispatch({ type: WorkflowTransitionActionType.CloseCommentModal });

        if (result.pendingEffects && result.pendingEffects.length > 0) {
          dispatch({ type: WorkflowTransitionActionType.SetPropagating });
          void pollPendingEffects();
        }
      } catch (err: unknown) {
        const anyErr = err as { status?: number };
        if (anyErr?.status === 409) {
          void refetch();
          notification.info({
            message: "Workflow updated",
            description:
              "This record was moved to another step by another user. Available actions have been refreshed.",
          });
          dispatch({ type: WorkflowTransitionActionType.CloseCommentModal });
        } else {
          // Check for 422 Workflow Transition Precondition Failed (incomplete score sheet submission)
          const errData = (anyErr as any)?.data;

          // Primary check: structured unassessed precondition payload
          if (
            (anyErr?.status === 422 ||
              errData?.code === "SCORE_SHEET_INCOMPLETE") &&
            errData?.details?.unassessed &&
            Array.isArray(errData.details.unassessed)
          ) {
            const reasonMap: Record<string, string> = {
              NO_SCORES: "No scores recorded",
              INCOMPLETE_SCORES: "Incomplete component scores",
            };

            const students = errData.details.unassessed.map((item: any) => ({
              matricNumber: item.regNo || item.matricNumber || "—",
              studentName:
                item.name || item.fullName || item.studentName || "Student",
              reason:
                reasonMap[item.reason] || item.reason || "Unassessed score sheet",
            }));

            dispatch({ type: WorkflowTransitionActionType.CloseCommentModal });
            dispatch({
              type: WorkflowTransitionActionType.OpenGatingModal,
              students,
            });
            return;
          }

          // Fallback: legacy regex string parsing
          const detail = errData?.detail || errData?.message;
          const gating = parseSubmissionPreconditionError(detail);
          if (gating && gating.students.length > 0) {
            dispatch({ type: WorkflowTransitionActionType.CloseCommentModal });
            dispatch({
              type: WorkflowTransitionActionType.OpenGatingModal,
              students: gating.students,
            });
            return;
          }

          handleApiError(err, {
            context: { screen: RequestScreen.Action, method: "POST" },
          });
        }
      }
    },
    [
      executeTransitionMutation,
      targetEntity,
      targetId,
      targetTag,
      pollPendingEffects,
      refetch,
      handleApiError,
    ],
  );

  const handleInitiateTransition = useCallback(
    (transition: WorkflowTransitionDto) => {
      if (transition.direction === "REVERSE" || transition.requiresComment) {
        dispatch({
          type: WorkflowTransitionActionType.OpenCommentModal,
          transition,
        });
      } else {
        void execute(transition);
      }
    },
    [execute],
  );

  const handleCommentChange = useCallback((comment: string) => {
    dispatch({ type: WorkflowTransitionActionType.SetComment, comment });
  }, []);

  const handleConfirmCommentModal = useCallback(() => {
    if (!state.selectedTransition || !state.comment.trim()) {
      return;
    }
    void execute(state.selectedTransition, state.comment.trim());
  }, [state.selectedTransition, state.comment, execute]);

  const handleCancelCommentModal = useCallback(() => {
    dispatch({ type: WorkflowTransitionActionType.CloseCommentModal });
  }, []);

  const handleOpenAuditDrawer = useCallback(() => {
    dispatch({ type: WorkflowTransitionActionType.OpenAuditDrawer });
  }, []);

  const handleCloseAuditDrawer = useCallback(() => {
    dispatch({ type: WorkflowTransitionActionType.CloseAuditDrawer });
  }, []);

  const handleCloseGatingModal = useCallback(() => {
    dispatch({ type: WorkflowTransitionActionType.CloseGatingModal });
  }, []);

  return {
    state: {
      availableTransitions,
      currentStep: availableTransitions?.currentStep,
      steps: availableTransitions?.steps ?? [],
      transitions: availableTransitions?.transitions ?? [],
      isLocked: availableTransitions?.isLocked ?? false,
      isTerminal: availableTransitions?.isTerminal ?? false,
      canAct:
        availableTransitions?.canAct ??
        availableTransitions?.currentStep?.canAct ??
        (availableTransitions?.transitions ?? []).length > 0,
      isLoading,
      isFetching,
      isExecuting,
      isCommentModalOpen: state.isCommentModalOpen,
      selectedTransition: state.selectedTransition,
      comment: state.comment,
      isPropagating: state.isPropagating,
      isAuditDrawerOpen: state.isAuditDrawerOpen,
      isGatingModalOpen: state.isGatingModalOpen,
      gatingStudents: state.gatingStudents,
    },
    actions: {
      handleInitiateTransition,
      handleCommentChange,
      handleConfirmCommentModal,
      handleCancelCommentModal,
      handleOpenAuditDrawer,
      handleCloseAuditDrawer,
      handleCloseGatingModal,
      refetch,
    },
  };
}

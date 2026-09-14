// Feature: settings/tabs/approval-workflows
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { useCallback } from "react";
import {
  useActivateWorkflowDefinitionMutation,
  useDeleteWorkflowStepMutation,
  useDeleteWorkflowTransitionMutation,
  useGetWorkflowDefinitionByIdQuery,
  useUpsertWorkflowStepMutation,
  useUpsertWorkflowTransitionMutation,
} from "../api/workflowConfigApi";
import type {
  UpsertWorkflowStepRequest,
  UpsertWorkflowTransitionRequest,
  WorkflowActivationViolation,
} from "../types/workflow-config";

type UseWorkflowDefinitionEditorOptions = {
  definitionId: number | null;
  onSetActivationViolations: (violations: WorkflowActivationViolation[]) => void;
};

export function useWorkflowDefinitionEditor({
  definitionId,
  onSetActivationViolations,
}: UseWorkflowDefinitionEditorOptions) {
  const handleApiError = useApiError();

  const {
    data: definition,
    isLoading,
    isFetching,
    refetch,
  } = useGetWorkflowDefinitionByIdQuery(definitionId!, {
    skip: !definitionId,
  });

  const [upsertStep, { isLoading: isSavingStep }] =
    useUpsertWorkflowStepMutation();
  const [deleteStep, { isLoading: isDeletingStep }] =
    useDeleteWorkflowStepMutation();

  const [upsertTransition, { isLoading: isSavingTransition }] =
    useUpsertWorkflowTransitionMutation();
  const [deleteTransition, { isLoading: isDeletingTransition }] =
    useDeleteWorkflowTransitionMutation();

  const [activateDefinition, { isLoading: isActivating }] =
    useActivateWorkflowDefinitionMutation();

  const handleSaveStep = useCallback(
    async (step: Omit<UpsertWorkflowStepRequest, "definitionId">) => {
      if (!definitionId) return;
      try {
        await upsertStep({ ...step, definitionId }).unwrap();
        notifyMutationSuccess(mutationSuccessMessage("Step", "saved"));
      } catch (err: unknown) {
        handleApiError(err, {
          context: { screen: RequestScreen.Modal, method: "POST" },
        });
      }
    },
    [definitionId, upsertStep, handleApiError],
  );

  const handleDeleteStep = useCallback(
    async (stepId: number) => {
      if (!definitionId) return;
      try {
        await deleteStep({ definitionId, stepId }).unwrap();
        notifyMutationSuccess(mutationSuccessMessage("Step", "deleted"));
      } catch (err: unknown) {
        handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "DELETE" },
        });
      }
    },
    [definitionId, deleteStep, handleApiError],
  );

  const handleSaveTransition = useCallback(
    async (
      transition: Omit<UpsertWorkflowTransitionRequest, "definitionId">,
    ) => {
      if (!definitionId) return;
      try {
        await upsertTransition({ ...transition, definitionId }).unwrap();
        notifyMutationSuccess(mutationSuccessMessage("Transition", "saved"));
      } catch (err: unknown) {
        handleApiError(err, {
          context: { screen: RequestScreen.Modal, method: "POST" },
        });
      }
    },
    [definitionId, upsertTransition, handleApiError],
  );

  const handleDeleteTransition = useCallback(
    async (transitionId: number) => {
      if (!definitionId) return;
      try {
        await deleteTransition({ definitionId, transitionId }).unwrap();
        notifyMutationSuccess(
          mutationSuccessMessage("Transition", "deleted"),
        );
      } catch (err: unknown) {
        handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "DELETE" },
        });
      }
    },
    [definitionId, deleteTransition, handleApiError],
  );

  const handleActivate = useCallback(async () => {
    if (!definitionId) return;
    try {
      await activateDefinition(definitionId).unwrap();
      notifyMutationSuccess("Workflow activated successfully.");
      onSetActivationViolations([]);
    } catch (err: unknown) {
      const anyErr = err as Record<string, unknown>;
      const errData = anyErr?.data as Record<string, unknown> | undefined;

      if (anyErr?.status === 422 && Array.isArray(errData?.violations)) {
        onSetActivationViolations(
          errData.violations as WorkflowActivationViolation[],
        );
      } else {
        handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "POST" },
        });
      }
    }
  }, [definitionId, activateDefinition, onSetActivationViolations, handleApiError]);

  return {
    state: {
      definition: definition ?? null,
      steps: definition?.steps ?? [],
      transitions: definition?.transitions ?? [],
      isLoading,
      isFetching,
      isSavingStep,
      isDeletingStep,
      isSavingTransition,
      isDeletingTransition,
      isActivating,
    },
    actions: {
      handleSaveStep,
      handleDeleteStep,
      handleSaveTransition,
      handleDeleteTransition,
      handleActivate,
      refetch,
    },
  };
}

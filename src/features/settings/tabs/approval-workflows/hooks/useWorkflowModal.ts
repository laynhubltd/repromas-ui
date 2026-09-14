// Feature: settings/tabs/approval-workflows
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useEffect } from "react";
import {
  useCreateWorkflowDefinitionMutation,
  useDeleteWorkflowDefinitionMutation,
  useUpdateWorkflowDefinitionMutation,
} from "../api/workflowConfigApi";
import type {
  CreateWorkflowDefinitionRequest,
  WorkflowDefinitionDto,
} from "../types/workflow-config";

// ─── Upsert (Create / Edit) Modal Hook ───────────────────────────────────────

export function useWorkflowFormModal(
  target: WorkflowDefinitionDto | null,
  open: boolean,
  onClose: () => void,
) {
  const [form] = Form.useForm<CreateWorkflowDefinitionRequest>();
  const isEditMode = target !== null;
  const handleApiError = useApiError();

  const [createDefinition, { isLoading: isCreating }] =
    useCreateWorkflowDefinitionMutation();
  const [updateDefinition, { isLoading: isUpdating }] =
    useUpdateWorkflowDefinitionMutation();

  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      if (target) {
        form.setFieldsValue({
          name: target.name,
          code: target.code,
          targetEntity: target.targetEntity,
          description: target.description ?? undefined,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          targetEntity: "SCORE_SHEET",
        });
      }
    }
  }, [open, target, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (isEditMode && target) {
        await updateDefinition({
          id: target.id,
          name: values.name,
          description: values.description,
        }).unwrap();
        notifyMutationSuccess(
          mutationSuccessMessage("Workflow definition", "updated"),
        );
      } else {
        await createDefinition(values).unwrap();
        notifyMutationSuccess(
          mutationSuccessMessage("Workflow definition", "created"),
        );
      }
      form.resetFields();
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Modal, method: isEditMode ? "PUT" : "POST" },
        form,
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return {
    state: {
      isEditMode,
      isSaving,
    },
    actions: {
      handleSubmit,
      handleCancel,
    },
    form,
  };
}

// ─── Delete Modal Hook ───────────────────────────────────────────────────────

export function useDeleteWorkflowModal(
  target: WorkflowDefinitionDto | null,
  open: boolean,
  onClose: () => void,
) {
  const handleApiError = useApiError();
  const [deleteDefinition, { isLoading: isDeleting }] =
    useDeleteWorkflowDefinitionMutation();

  const handleDelete = async () => {
    if (!target) return;
    try {
      await deleteDefinition(target.id).unwrap();
      notifyMutationSuccess(
        mutationSuccessMessage("Workflow definition", "deleted"),
      );
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "DELETE" },
      });
    }
  };

  return {
    state: {
      isDeleting,
    },
    actions: {
      handleDelete,
      handleCancel: onClose,
    },
  };
}

import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { Form, notification } from "antd";
import { useCallback, useEffect } from "react";
import {
  useCreateProgramOlevelRequirementMutation,
  useDeleteProgramOlevelRequirementMutation,
  useUpdateProgramOlevelRequirementMutation,
} from "../api/programOlevelRuleApi";
import type { ProgramOlevelRequirement } from "../types/program-olevel-rule";

type ProgramOlevelRuleFormValues = {
  programId: number;
  subjectId: number;
  isCompulsory: boolean;
};

export function useProgramOlevelRuleFormModal(
  target: ProgramOlevelRequirement | null,
  open: boolean,
  onClose: () => void,
  presetProgramId: number | undefined,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<ProgramOlevelRuleFormValues>();

  const [createRequirement, { isLoading: isCreating }] =
    useCreateProgramOlevelRequirementMutation();
  const [updateRequirement, { isLoading: isUpdating }] =
    useUpdateProgramOlevelRequirementMutation();
  const handleApiError = useApiError();

  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (open && isEditMode && target) {
      form.setFieldsValue({
        programId: target.programId,
        subjectId: target.subjectId,
        isCompulsory: target.isCompulsory,
      });
    } else if (open && !isEditMode) {
      form.setFieldsValue({
        programId: presetProgramId,
        subjectId: undefined,
        isCompulsory: true,
      });
    }
  }, [open, isEditMode, target, presetProgramId, form]);

  const reset = useCallback(() => {
    form.resetFields();
  }, [form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const programId = values.programId;
      const subjectId = values.subjectId;
      const isCompulsory = values.isCompulsory ?? true;

      if (isEditMode && target) {
        await updateRequirement({
          id: target.id,
          programId,
          subjectId,
          isCompulsory,
        }).unwrap();

        notification.success({
          message: "Program O'Level requirement updated successfully.",
        });
      } else {
        await createRequirement({
          programId,
          subjectId,
          isCompulsory,
        }).unwrap();

        notification.success({
          message: "Program O'Level requirement created successfully.",
        });
      }

      reset();
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: {
          screen: RequestScreen.Modal,
          method: isEditMode ? "PATCH" : "POST",
        },
        form,
      });
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return {
    state: {
      isEditMode,
      isSubmitting,
      programLocked: isEditMode || presetProgramId !== undefined,
    },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

export function useDeleteProgramOlevelRuleModal(
  target: ProgramOlevelRequirement | null,
  _open: boolean,
  onClose: () => void,
) {
  const [deleteRequirement, { isLoading: isDeleting }] =
    useDeleteProgramOlevelRequirementMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteRequirement(target.id).unwrap();
      notification.success({
        message: "Program O'Level requirement removed successfully.",
      });
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "DELETE" },
      });
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return {
    state: { isDeleting },
    actions: { handleConfirm, handleCancel },
  };
}

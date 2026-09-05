import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useEffect } from "react";
import {
    useCreateProgramMutation,
    useDeleteProgramMutation,
    useUpdateProgramMutation,
} from "../api/programsApi";
import type { Program } from "../types/program";

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

/**
 * Upsert hook for Program form modal.
 * - target === null  → create mode
 * - target !== null  → edit mode
 */
export function useProgramFormModal(
  target: Program | null,
  open: boolean,
  onClose: () => void,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm();
  const [createProgram, { isLoading: isCreating }] = useCreateProgramMutation();
  const [updateProgram, { isLoading: isUpdating }] = useUpdateProgramMutation();
  const handleApiError = useApiError();

  const isLoading = isCreating || isUpdating;

  // Pre-fill form in edit mode
  useEffect(() => {
    if (open && target) {
      form.setFieldsValue({
        departmentId: target.departmentId,
        code: target.code,
        name: target.name,
        degreeTitle: target.degreeTitle,
        durationInYears: target.durationInYears,
        maxResidencyYears: target.maxResidencyYears,
        categoryId: target.categoryId,
      });
    }
  }, [open, target, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (isEditMode) {
        await updateProgram({
          id: target.id,
          departmentId: values.departmentId,
          code: values.code.trim(),
          name: values.name.trim(),
          degreeTitle: values.degreeTitle.trim(),
          durationInYears: values.durationInYears,
          maxResidencyYears: values.maxResidencyYears,
          categoryId: values.categoryId,
        }).unwrap();
      } else {
        await createProgram({
          departmentId: values.departmentId,
          code: values.code.trim(),
          name: values.name.trim(),
          degreeTitle: values.degreeTitle.trim(),
          durationInYears: values.durationInYears,
          maxResidencyYears: values.maxResidencyYears,
          categoryId: values.categoryId,
        }).unwrap();
      }
      notifyMutationSuccess(
        mutationSuccessMessage("Program", isEditMode ? "updated" : "created"),
      );
      form.resetFields();
      onClose();
    } catch (err: unknown) {
      const decision = handleApiError(err, {
        context: {
          screen: RequestScreen.Modal,
          method: isEditMode ? "PATCH" : "POST",
        },
        form,
      });
      if (isEditMode && decision.disableForm) {
        onClose();
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return {
    state: { isLoading, isEditMode },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteProgramModal(target: Program | null, onClose: () => void) {
  const [deleteProgram, { isLoading }] = useDeleteProgramMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteProgram(target.id).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Program", "deleted"));
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
    state: { isLoading },
    actions: { handleConfirm, handleCancel },
  };
}

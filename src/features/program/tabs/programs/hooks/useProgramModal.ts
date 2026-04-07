import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
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
  const [formError, setFormError] = useState<string | null>(null);

  const isLoading = isCreating || isUpdating;

  // Pre-fill form in edit mode
  useEffect(() => {
    if (open && target) {
      form.setFieldsValue({
        departmentId: target.departmentId,
        name: target.name,
        degreeTitle: target.degreeTitle,
        durationInYears: target.durationInYears,
        maxResidencyYears: target.maxResidencyYears,
      });
    }
    if (!open) {
      setFormError(null);
    }
  }, [open, target, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormError(null);
      if (isEditMode) {
        await updateProgram({
          id: target.id,
          departmentId: values.departmentId,
          name: values.name.trim(),
          degreeTitle: values.degreeTitle.trim(),
          durationInYears: values.durationInYears,
          maxResidencyYears: values.maxResidencyYears,
        }).unwrap();
      } else {
        await createProgram({
          departmentId: values.departmentId,
          name: values.name.trim(),
          degreeTitle: values.degreeTitle.trim(),
          durationInYears: values.durationInYears,
          maxResidencyYears: values.maxResidencyYears,
        }).unwrap();
      }
      form.resetFields();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
      applyFormErrors(parsed, form, setFormError);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFormError(null);
    onClose();
  };

  return {
    state: { formError, isLoading, isEditMode },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteProgramModal(target: Program | null, onClose: () => void) {
  const [deleteProgram, { isLoading }] = useDeleteProgramMutation();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteProgram(target.id).unwrap();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
      setError(parsed.message);
    }
  };

  const handleCancel = () => {
    setError(null);
    onClose();
  };

  return {
    state: { error, isLoading },
    actions: { handleConfirm, handleCancel },
  };
}

// Feature: faculty-department-management
import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
import {
    useCreateFacultyMutation,
    useDeleteFacultyMutation,
    useUpdateFacultyMutation,
} from "../api/facultiesApi";
import type { Faculty } from "../types/faculty";

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

/**
 * Upsert hook for Faculty form modal.
 * - target === null  → create mode
 * - target !== null  → edit mode
 */
export function useFacultyFormModal(
  target: Faculty | null,
  open: boolean,
  onClose: () => void
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<{ name: string; code: string }>();
  const [createFaculty, { isLoading: isCreating }] = useCreateFacultyMutation();
  const [updateFaculty, { isLoading: isUpdating }] = useUpdateFacultyMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const isLoading = isCreating || isUpdating;

  // Pre-fill form in edit mode
  useEffect(() => {
    if (open && target) {
      form.setFieldsValue({ name: target.name, code: target.code });
    }
  }, [open, target, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormError(null);
      if (isEditMode) {
        await updateFaculty({
          id: target.id,
          name: values.name.trim(),
          code: values.code.trim(),
        }).unwrap();
      } else {
        await createFaculty({ name: values.name.trim(), code: values.code.trim() }).unwrap();
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

export function useDeleteFacultyModal(target: Faculty | null, onClose: () => void) {
  const [deleteFaculty, { isLoading }] = useDeleteFacultyMutation();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteFaculty(target.id).unwrap();
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

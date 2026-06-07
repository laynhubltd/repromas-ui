// Feature: faculty-department-management
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useEffect } from "react";
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
  const handleApiError = useApiError();

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
      if (isEditMode) {
        await updateFaculty({
          id: target.id,
          name: values.name.trim(),
          code: values.code.trim(),
        }).unwrap();
      } else {
        await createFaculty({ name: values.name.trim(), code: values.code.trim() }).unwrap();
      }
      notifyMutationSuccess(
        mutationSuccessMessage("Faculty", isEditMode ? "updated" : "created"),
      );
      form.resetFields();
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

export function useDeleteFacultyModal(target: Faculty | null, onClose: () => void) {
  const [deleteFaculty, { isLoading }] = useDeleteFacultyMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteFaculty(target.id).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Faculty", "deleted"));
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

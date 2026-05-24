import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useEffect } from "react";
import {
    useCreateSemesterTypeMutation,
    useDeleteSemesterTypeMutation,
    useUpdateSemesterTypeMutation,
} from "../api/academicCalendarApi";
import type { SemesterType } from "../types/academic-calendar";

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

type SemesterTypeFormValues = {
  name: string;
  code: string;
  sortOrder: number;
};

/**
 * Upsert hook for SemesterType form modal.
 * - target === null  → create mode
 * - target !== null  → edit mode
 */
export function useSemesterTypeFormModal(
  target: SemesterType | null,
  open: boolean,
  onClose: () => void
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<SemesterTypeFormValues>();
  const [createSemesterType, { isLoading: isCreating }] = useCreateSemesterTypeMutation();
  const [updateSemesterType, { isLoading: isUpdating }] = useUpdateSemesterTypeMutation();
  const handleApiError = useApiError();

  const isLoading = isCreating || isUpdating;

  // Pre-fill form in edit mode
  useEffect(() => {
    if (open && target) {
      form.setFieldsValue({
        name: target.name,
        code: target.code,
        sortOrder: target.sortOrder,
      });
    }
  }, [open, target, form]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditMode) {
        await updateSemesterType({
          id: target.id,
          name: values.name.trim(),
          code: values.code.trim(),
          sortOrder: values.sortOrder,
        }).unwrap();
      } else {
        await createSemesterType({
          name: values.name.trim(),
          code: values.code.trim(),
          sortOrder: values.sortOrder,
        }).unwrap();
      }

      notifyMutationSuccess(
        mutationSuccessMessage("Semester type", isEditMode ? "updated" : "created"),
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

export function useDeleteSemesterTypeModal(
  target: SemesterType | null,
  onClose: () => void
) {
  const [deleteSemesterType, { isLoading }] = useDeleteSemesterTypeMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteSemesterType(target.id).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Semester type", "deleted"));
      onClose();
    } catch (err: unknown) {
      const decision = handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "DELETE" },
      });
      if (decision.parsed.status === 404) {
        onClose();
      }
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

import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
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
  const [formError, setFormError] = useState<string | null>(null);

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
      setFormError(null);
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormError(null);

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

      form.resetFields();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });

      // 409 conflict — map inline field errors by checking detail content
      if (parsed.status === 409) {
        const detail = (parsed.raw.detail ?? "").toLowerCase();
        if (detail.includes("code")) {
          form.setFields([{ name: "code", errors: [parsed.message] }]);
          return;
        }
        if (detail.includes("sortorder") || detail.includes("sort_order") || detail.includes("sort order")) {
          form.setFields([{ name: "sortOrder", errors: [parsed.message] }]);
          return;
        }
      }

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

export function useDeleteSemesterTypeModal(
  target: SemesterType | null,
  onClose: () => void
) {
  const [deleteSemesterType, { isLoading }] = useDeleteSemesterTypeMutation();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteSemesterType(target.id).unwrap();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);

      if (parsed.status === 404) {
        notification.success({ message: "Already removed" });
        onClose();
        return;
      }

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

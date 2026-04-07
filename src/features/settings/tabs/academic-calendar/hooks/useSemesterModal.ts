import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
import {
    useCreateSemesterMutation,
    useDeleteSemesterMutation,
    useUpdateSemesterMutation,
} from "../api/academicCalendarApi";
import type { Semester } from "../types/academic-calendar";

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

type SemesterFormValues = {
  semesterTypeId: number;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean;
};

/**
 * Upsert hook for Semester form modal.
 * - target === null  → create mode (only sessionId + semesterTypeId sent)
 * - target !== null  → edit mode (semesterTypeId, startDate, endDate, isCurrent sent; never sessionId)
 */
export function useSemesterFormModal(
  target: Semester | null,
  sessionId: number | null,
  open: boolean,
  onClose: () => void
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<SemesterFormValues>();
  const [createSemester, { isLoading: isCreating }] = useCreateSemesterMutation();
  const [updateSemester, { isLoading: isUpdating }] = useUpdateSemesterMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const isLoading = isCreating || isUpdating;

  // Pre-fill form in edit mode
  useEffect(() => {
    if (open && target) {
      form.setFieldsValue({
        semesterTypeId: target.semesterTypeId,
        startDate: target.startDate ?? undefined,
        endDate: target.endDate ?? undefined,
        isCurrent: target.isCurrent,
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
        // Edit: send semesterTypeId, startDate, endDate, isCurrent — never sessionId
        await updateSemester({
          id: target.id,
          semesterTypeId: values.semesterTypeId,
          startDate: values.startDate ?? null,
          endDate: values.endDate ?? null,
          isCurrent: values.isCurrent ?? target.isCurrent,
        }).unwrap();
      } else {
        // Create: send only sessionId + semesterTypeId — never status, isCurrent, startDate, endDate
        await createSemester({
          sessionId: sessionId!,
          semesterTypeId: values.semesterTypeId,
        }).unwrap();
      }

      form.resetFields();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });

      // 409 conflict — duplicate (sessionId + semesterTypeId)
      if (parsed.status === 409) {
        form.setFields([{ name: "semesterTypeId", errors: [parsed.message] }]);
        return;
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

export function useDeleteSemesterModal(
  target: Semester | null,
  onClose: () => void
) {
  const [deleteSemester, { isLoading }] = useDeleteSemesterMutation();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteSemester(target.id).unwrap();
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

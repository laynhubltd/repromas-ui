import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
import {
    useCreateAcademicSessionMutation,
    useDeleteAcademicSessionMutation,
    useUpdateAcademicSessionMutation,
} from "../api/academicCalendarApi";
import type { AcademicSession } from "../types/academic-calendar";

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

type SessionFormValues = {
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean;
};

/**
 * Upsert hook for AcademicSession form modal.
 * - target === null  → create mode
 * - target !== null  → edit mode
 */
export function useSessionFormModal(
  target: AcademicSession | null,
  open: boolean,
  onClose: () => void
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<SessionFormValues>();
  const [createAcademicSession, { isLoading: isCreating }] = useCreateAcademicSessionMutation();
  const [updateAcademicSession, { isLoading: isUpdating }] = useUpdateAcademicSessionMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const isLoading = isCreating || isUpdating;

  // Pre-fill form in edit mode
  useEffect(() => {
    if (open && target) {
      form.setFieldsValue({
        name: target.name,
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
        await updateAcademicSession({
          id: target.id,
          name: values.name.trim(),
          startDate: values.startDate ?? null,
          endDate: values.endDate ?? null,
          isCurrent: values.isCurrent ?? target.isCurrent,
        }).unwrap();
      } else {
        await createAcademicSession({
          name: values.name.trim(),
          ...(values.startDate != null && { startDate: values.startDate }),
          ...(values.endDate != null && { endDate: values.endDate }),
        }).unwrap();
      }

      form.resetFields();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });

      // 409 conflict — duplicate name
      if (parsed.status === 409) {
        form.setFields([{ name: "name", errors: [parsed.message] }]);
        return;
      }

      // 400 date order — endDate not after startDate
      if (parsed.status === 400) {
        form.setFields([{ name: "endDate", errors: [parsed.message] }]);
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

export function useDeleteSessionModal(
  target: AcademicSession | null,
  onClose: () => void
) {
  const [deleteAcademicSession, { isLoading }] = useDeleteAcademicSessionMutation();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteAcademicSession(target.id).unwrap();
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

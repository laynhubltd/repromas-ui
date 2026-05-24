import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useEffect } from "react";
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
  const handleApiError = useApiError();

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
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

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

      notifyMutationSuccess(
        mutationSuccessMessage("Academic session", isEditMode ? "updated" : "created"),
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

export function useDeleteSessionModal(
  target: AcademicSession | null,
  onClose: () => void
) {
  const [deleteAcademicSession, { isLoading }] = useDeleteAcademicSessionMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteAcademicSession(target.id).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Academic session", "deleted"));
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

import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useEffect } from "react";
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
  const handleApiError = useApiError();

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
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

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

      notifyMutationSuccess(
        mutationSuccessMessage("Semester", isEditMode ? "updated" : "created"),
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

export function useDeleteSemesterModal(
  target: Semester | null,
  onClose: () => void
) {
  const [deleteSemester, { isLoading }] = useDeleteSemesterMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteSemester(target.id).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Semester", "deleted"));
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

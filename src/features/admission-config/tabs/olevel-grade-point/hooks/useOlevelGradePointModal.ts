import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { Form, notification } from "antd";
import { useCallback, useEffect } from "react";
import {
  useCreateOlevelGradePointMutation,
  useDeleteOlevelGradePointMutation,
  useUpdateOlevelGradePointMutation,
} from "../api/olevelGradePointApi";
import type { OlevelGradePoint } from "../types/olevel-grade-point";

type OlevelGradePointFormValues = {
  grade: string;
  points: number;
};

export function useOlevelGradePointFormModal(
  target: OlevelGradePoint | null,
  open: boolean,
  onClose: () => void,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<OlevelGradePointFormValues>();

  const [createOlevelGradePoint, { isLoading: isCreating }] =
    useCreateOlevelGradePointMutation();
  const [updateOlevelGradePoint, { isLoading: isUpdating }] =
    useUpdateOlevelGradePointMutation();
  const handleApiError = useApiError();

  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (open && isEditMode && target) {
      form.setFieldsValue({
        grade: target.grade,
        points: target.points,
      });
    } else if (open && !isEditMode) {
      form.setFieldsValue({ grade: undefined, points: undefined });
    }
  }, [open, isEditMode, target, form]);

  const reset = useCallback(() => {
    form.resetFields();
  }, [form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const grade = values.grade.trim().toUpperCase();
      const points = values.points;

      if (isEditMode && target) {
        await updateOlevelGradePoint({
          id: target.id,
          grade,
          points,
        }).unwrap();
        notification.success({
          message: "Grade mapping updated successfully.",
        });
      } else {
        await createOlevelGradePoint({ grade, points }).unwrap();
        notification.success({
          message: "Grade mapping created successfully.",
        });
      }

      reset();
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
    reset();
    onClose();
  };

  return {
    state: { isEditMode, isSubmitting },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

export function useDeleteOlevelGradePointModal(
  target: OlevelGradePoint | null,
  _open: boolean,
  onClose: () => void,
) {
  const [deleteOlevelGradePoint, { isLoading: isDeleting }] =
    useDeleteOlevelGradePointMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteOlevelGradePoint(target.id).unwrap();
      notification.success({
        message: "Grade mapping deleted successfully.",
      });
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
    state: { isDeleting },
    actions: { handleConfirm, handleCancel },
  };
}

import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useCallback, useEffect, useReducer, useState } from "react";
import {
  useCreateOlevelGradePointMutation,
  useDeleteOlevelGradePointMutation,
  useUpdateOlevelGradePointMutation,
} from "../api/olevelGradePointApi";
import {
  initialOlevelGradePointFormState,
  olevelGradePointFormReducer,
  OlevelGradePointFormActionType,
} from "../state/olevelGradePointFormState";
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
  const [modalState, dispatch] = useReducer(
    olevelGradePointFormReducer,
    initialOlevelGradePointFormState,
  );
  const { formError } = modalState;

  const [createOlevelGradePoint, { isLoading: isCreating }] =
    useCreateOlevelGradePointMutation();
  const [updateOlevelGradePoint, { isLoading: isUpdating }] =
    useUpdateOlevelGradePointMutation();

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
    dispatch({ type: OlevelGradePointFormActionType.Reset });
  }, [form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      dispatch({
        type: OlevelGradePointFormActionType.SetFormError,
        message: null,
      });

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
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
      applyFormErrors(parsed, form, (msg) =>
        dispatch({
          type: OlevelGradePointFormActionType.SetFormError,
          message: msg,
        }),
      );
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return {
    state: { isEditMode, formError, isSubmitting },
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
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteOlevelGradePoint(target.id).unwrap();
      notification.success({
        message: "Grade mapping deleted successfully.",
      });
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
    state: { error, isDeleting },
    actions: { handleConfirm, handleCancel },
  };
}

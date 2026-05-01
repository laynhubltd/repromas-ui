// Feature: grading-config — Grading System Boundary modal hooks
import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useCallback, useEffect, useReducer, useState } from "react";
import {
    useCreateGradingSystemBoundaryMutation,
    useDeleteGradingSystemBoundaryMutation,
    useUpdateGradingSystemBoundaryMutation,
} from "../api/gradingSystemBoundaryApi";
import {
    GradingSystemBoundaryFormActionType,
    gradingSystemBoundaryFormReducer,
    initialGradingSystemBoundaryFormState,
} from "../state/gradingSystemBoundaryFormState";
import type { GradingSystemBoundary } from "../types/grading-system-boundary";
import { detectOverlap } from "../utils/overlapDetection";

// ─── Types ────────────────────────────────────────────────────────────────────

type GradingSystemBoundaryFormValues = {
  letterGrade: string;
  minScore: number;
  maxScore: number;
  gradePoint: number;
  isPass: boolean;
};

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

export function useGradingSystemBoundaryFormModal(
  target: GradingSystemBoundary | null,
  gradingSystemId: number | null,
  open: boolean,
  onClose: () => void,
  existingBoundaries: GradingSystemBoundary[],
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<GradingSystemBoundaryFormValues>();
  const [modalState, dispatch] = useReducer(
    gradingSystemBoundaryFormReducer,
    initialGradingSystemBoundaryFormState,
  );
  const { formError, overlapError } = modalState;

  const [createGradingSystemBoundary, { isLoading: isCreating }] =
    useCreateGradingSystemBoundaryMutation();
  const [updateGradingSystemBoundary, { isLoading: isUpdating }] =
    useUpdateGradingSystemBoundaryMutation();

  const isSubmitting = isCreating || isUpdating;

  // Pre-fill form in edit mode
  useEffect(() => {
    if (open && isEditMode && target) {
      form.setFieldsValue({
        letterGrade: target.letterGrade,
        minScore: target.minScore,
        maxScore: target.maxScore,
        gradePoint: target.gradePoint,
        isPass: target.isPass,
      });
    }
  }, [open, isEditMode, target, form]);

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: GradingSystemBoundaryFormActionType.Reset });
  }, [form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Clear previous errors
      dispatch({
        type: GradingSystemBoundaryFormActionType.SetFormError,
        message: null,
      });
      dispatch({
        type: GradingSystemBoundaryFormActionType.SetOverlapError,
        message: null,
      });

      // Client-side overlap check — exclude self in edit mode
      const newRange: [number, number] = [values.minScore, values.maxScore];
      const boundariesToCheck = isEditMode
        ? existingBoundaries.filter((b) => b.id !== target.id)
        : existingBoundaries;

      const overlapping = boundariesToCheck.find((b) =>
        detectOverlap(newRange, [b.minScore, b.maxScore]),
      );

      if (overlapping) {
        const overlapMsg = `Score range overlaps with existing grade '${overlapping.letterGrade}'.`;
        dispatch({
          type: GradingSystemBoundaryFormActionType.SetOverlapError,
          message: overlapMsg,
        });
        return;
      }

      if (isEditMode) {
        await updateGradingSystemBoundary({
          id: target.id,
          letterGrade: values.letterGrade,
          minScore: values.minScore,
          maxScore: values.maxScore,
          gradePoint: values.gradePoint,
          isPass: values.isPass,
        }).unwrap();
        notification.success({
          message: "Grade boundary updated successfully.",
        });
      } else {
        if (gradingSystemId === null) return;
        await createGradingSystemBoundary({
          gradingSystemId,
          letterGrade: values.letterGrade,
          minScore: values.minScore,
          maxScore: values.maxScore,
          gradePoint: values.gradePoint,
          isPass: values.isPass,
        }).unwrap();
        notification.success({
          message: "Grade boundary created successfully.",
        });
      }

      reset();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);

      if (parsed.status === 409) {
        notification.error({ message: parsed.message });
        dispatch({
          type: GradingSystemBoundaryFormActionType.SetFormError,
          message: parsed.message,
        });
        return;
      }

      notification.error({ message: parsed.message });
      applyFormErrors(parsed, form, (msg) =>
        dispatch({
          type: GradingSystemBoundaryFormActionType.SetFormError,
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
    state: {
      isEditMode,
      isSubmitting,
      formError,
      overlapError,
    },
    actions: {
      handleSubmit,
      handleCancel,
    },
    form,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteGradingSystemBoundaryModal(
  target: GradingSystemBoundary | null,
  _open: boolean,
  onClose: () => void,
) {
  const [deleteGradingSystemBoundary, { isLoading: isDeleting }] =
    useDeleteGradingSystemBoundaryMutation();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteGradingSystemBoundary(target.id).unwrap();
      notification.success({
        message: "Grade boundary deleted successfully.",
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
    state: { isDeleting, error },
    actions: { handleConfirm, handleCancel },
  };
}

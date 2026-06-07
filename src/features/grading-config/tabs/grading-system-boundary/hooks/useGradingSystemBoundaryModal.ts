// Feature: grading-config — Grading System Boundary modal hooks
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { Form, notification } from "antd";
import { useCallback, useEffect, useReducer } from "react";
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
  const { overlapError } = modalState;
  const handleApiError = useApiError();

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
    state: {
      isEditMode,
      isSubmitting,
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
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteGradingSystemBoundary(target.id).unwrap();
      notification.success({
        message: "Grade boundary deleted successfully.",
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

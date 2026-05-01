// Feature: grading-config — Grading System modal hooks
import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useCallback, useEffect, useReducer, useState } from "react";
import {
    useCreateGradingSystemMutation,
    useDeleteGradingSystemMutation,
    useUpdateGradingSystemMutation,
} from "../api/gradingSystemApi";
import {
    GradingSystemFormActionType,
    gradingSystemFormReducer,
    initialGradingSystemFormState,
} from "../state/gradingSystemFormState";
import type {
    GradingSystem,
    GradingSystemScope,
    UpdateGradingSystemRequest,
} from "../types/grading-system";

// ─── Types ────────────────────────────────────────────────────────────────────

type GradingSystemFormValues = {
  name: string;
  isGpaBased: boolean;
  maxCgpa: number | null;
  scope: GradingSystemScope;
  referenceId: number | null;
  levelId: number | null;
  curriculumVersionId: number | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Strips immutable fields (scope, referenceId, curriculumVersionId) from a
 * GradingSystem to produce the PUT payload shape.
 *
 * Exported as a named export so it can be tested independently (task 12.4 PBT).
 */
export function buildUpdatePayload(
  system: GradingSystem,
): UpdateGradingSystemRequest {
  return {
    id: system.id,
    name: system.name,
    isGpaBased: system.isGpaBased,
    maxCgpa: system.maxCgpa,
    levelId: system.levelId,
  };
}

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

export function useGradingSystemFormModal(
  target: GradingSystem | null,
  open: boolean,
  onClose: () => void,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<GradingSystemFormValues>();
  const [modalState, dispatch] = useReducer(
    gradingSystemFormReducer,
    initialGradingSystemFormState,
  );
  const { formError, scope, isGpaBased } = modalState;

  const [createGradingSystem, { isLoading: isCreating }] =
    useCreateGradingSystemMutation();
  const [updateGradingSystem, { isLoading: isUpdating }] =
    useUpdateGradingSystemMutation();

  const isSubmitting = isCreating || isUpdating;

  // Pre-fill form in edit mode
  useEffect(() => {
    if (open && isEditMode && target) {
      form.setFieldsValue({
        name: target.name,
        isGpaBased: target.isGpaBased,
        maxCgpa: target.maxCgpa,
        scope: target.scope,
        referenceId: target.referenceId,
        levelId: target.levelId,
        curriculumVersionId: target.curriculumVersionId,
      });
      dispatch({
        type: GradingSystemFormActionType.SetIsGpaBased,
        value: target.isGpaBased,
      });
    }
  }, [open, isEditMode, target, form]);

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: GradingSystemFormActionType.Reset });
  }, [form]);

  // Scope → referenceId coupling (create mode only)
  const handleScopeChange = useCallback(
    (newScope: GradingSystemScope) => {
      dispatch({ type: GradingSystemFormActionType.SetScope, scope: newScope });
      if (newScope === "GLOBAL") {
        // Reducer already clears referenceId; also clear the form field
        form.setFieldValue("referenceId", null);
      }
    },
    [form],
  );

  // isGpaBased → maxCgpa coupling
  const handleIsGpaBasedChange = useCallback(
    (value: boolean) => {
      dispatch({ type: GradingSystemFormActionType.SetIsGpaBased, value });
      if (!value) {
        form.setFieldValue("maxCgpa", null);
      }
    },
    [form],
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      dispatch({
        type: GradingSystemFormActionType.SetFormError,
        message: null,
      });

      if (isEditMode) {
        // PUT: only mutable fields — strip scope, referenceId, curriculumVersionId
        await updateGradingSystem({
          id: target.id,
          name: values.name,
          isGpaBased: values.isGpaBased,
          maxCgpa: values.maxCgpa,
          levelId: values.levelId,
        }).unwrap();
        notification.success({
          message: "Grading system updated successfully.",
        });
      } else {
        // POST: all fields including scope, referenceId, curriculumVersionId
        await createGradingSystem({
          name: values.name,
          isGpaBased: values.isGpaBased,
          maxCgpa: values.maxCgpa,
          scope: values.scope,
          referenceId: values.referenceId,
          levelId: values.levelId,
          curriculumVersionId: values.curriculumVersionId,
        }).unwrap();
        notification.success({
          message: "Grading system created successfully.",
        });
      }

      reset();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);

      if (parsed.status === 409) {
        notification.error({ message: parsed.message });
        dispatch({
          type: GradingSystemFormActionType.SetFormError,
          message: parsed.message,
        });
        return;
      }

      notification.error({ message: parsed.message });
      applyFormErrors(parsed, form, (msg) =>
        dispatch({
          type: GradingSystemFormActionType.SetFormError,
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
      scope,
      isGpaBased,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleScopeChange,
      handleIsGpaBasedChange,
    },
    form,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteGradingSystemModal(
  target: GradingSystem | null,
  _open: boolean,
  onClose: () => void,
  /**
   * Optional boundary count passed from the component.
   * The boundary API (task 8.3) is not yet created; the component is
   * responsible for fetching and forwarding this value.
   */
  boundaryCount?: number,
) {
  const [deleteGradingSystem, { isLoading: isDeleting }] =
    useDeleteGradingSystemMutation();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteGradingSystem(target.id).unwrap();
      notification.success({
        message: "Grading system deleted successfully.",
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
    state: { isDeleting, error, boundaryCount },
    actions: { handleConfirm, handleCancel },
  };
}

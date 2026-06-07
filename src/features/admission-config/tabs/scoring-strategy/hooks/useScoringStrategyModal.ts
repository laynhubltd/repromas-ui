// Feature: admission-config — Scoring Strategy modal hooks
// Requirements: 8.1–8.14, 9.1–9.10, 10.1–10.8, 16.2, 16.3

import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { Form, notification } from "antd";
import { useCallback, useEffect, useReducer } from "react";
import {
  useCreateScoringStrategyMutation,
  useDeleteScoringStrategyMutation,
  useGetScoringStrategiesQuery,
  useUpdateScoringStrategyMutation,
} from "../api/scoringStrategyApi";
import {
  ScoringStrategyFormActionType,
  scoringStrategyFormReducer,
  initialScoringStrategyFormState,
} from "../state/scoringStrategyFormState";
import type {
  AdmissionScoringStrategy,
  ScopeValue,
  StrategyPayload,
} from "../types/scoring-strategy";

// ─── Types ────────────────────────────────────────────────────────────────────

type ScoringStrategyFormValues = {
  scope: ScopeValue;
  referenceId: number | null;
  screening_method: "JAMB_ONLY" | "OLEVEL_GRADING" | "POST_UTME_TEST";
  jamb_weight_percentage: number;
  school_weight_percentage: number;
  max_jamb_score: number;
  max_school_score: number;
  description?: string;
};

// ─── Preset Definitions ───────────────────────────────────────────────────────

const PRESETS = {
  "jamb-only": {
    screening_method: "JAMB_ONLY" as const,
    jamb_weight_percentage: 100,
    school_weight_percentage: 0,
    max_jamb_score: 400,
    max_school_score: 100,
  },
  "olevel-5050": {
    screening_method: "OLEVEL_GRADING" as const,
    jamb_weight_percentage: 50,
    school_weight_percentage: 50,
    max_jamb_score: 400,
    max_school_score: 30,
  },
  "post-utme-5050": {
    screening_method: "POST_UTME_TEST" as const,
    jamb_weight_percentage: 50,
    school_weight_percentage: 50,
    max_jamb_score: 400,
    max_school_score: 100,
  },
} as const;

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

/**
 * Hook for managing the scoring strategy form modal (create and edit modes).
 *
 * Requirements: 8.1–8.14, 9.1–9.10, 16.2, 16.3
 *
 * @param target - The strategy to edit, or null for create mode
 * @param open - Whether the modal is open
 * @param onClose - Callback to close the modal
 * @returns State and action handlers for the form modal
 */
export function useScoringStrategyFormModal(
  target: AdmissionScoringStrategy | null,
  open: boolean,
  onClose: () => void,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<ScoringStrategyFormValues>();
  const [modalState, dispatch] = useReducer(
    scoringStrategyFormReducer,
    initialScoringStrategyFormState,
  );
  const { formError } = modalState;

  // Always call both mutations per Rules of Hooks (Req 8.1)
  const [createScoringStrategy, { isLoading: isCreating }] =
    useCreateScoringStrategyMutation();
  const [updateScoringStrategy, { isLoading: isUpdating }] =
    useUpdateScoringStrategyMutation();
  const handleApiError = useApiError();

  const isSubmitting = isCreating || isUpdating;
  const screeningMethod = Form.useWatch("screening_method", form);
  const isJambOnly = screeningMethod === "JAMB_ONLY";

  // Pre-fill form in edit mode (Req 9.1–9.3)
  // Initialize form with default values in create mode
  useEffect(() => {
    if (open && isEditMode && target) {
      form.setFieldsValue({
        scope: target.scope,
        referenceId: target.referenceId,
        screening_method: target.strategy.screening_method,
        jamb_weight_percentage: target.strategy.jamb_weight_percentage,
        school_weight_percentage: target.strategy.school_weight_percentage,
        max_jamb_score: target.strategy.max_jamb_score,
        max_school_score: target.strategy.max_school_score,
        description: target.description || undefined,
      });
    } else if (open && !isEditMode) {
      // Initialize create mode with default values
      form.setFieldsValue({
        scope: undefined,
        referenceId: null,
        screening_method: undefined,
        jamb_weight_percentage: 0,
        school_weight_percentage: 0,
        max_jamb_score: 400,
        max_school_score: 100,
        description: undefined,
      });
    }
  }, [open, isEditMode, target, form]);

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: ScoringStrategyFormActionType.Reset });
  }, [form]);

  /**
   * Handle screening method change (Req 8.5–8.6)
   * If JAMB_ONLY: lock weights to 100/0
   * Otherwise: unlock weights
   */
  const handleMethodChange = useCallback(
    (method: "JAMB_ONLY" | "OLEVEL_GRADING" | "POST_UTME_TEST") => {
      if (method === "JAMB_ONLY") {
        form.setFieldsValue({
          jamb_weight_percentage: 100,
          school_weight_percentage: 0,
        });
      }
    },
    [form],
  );

  /**
   * Handle preset button click (Req 8.7)
   * Pre-fill all five strategy fields from preset table
   */
  const handlePreset = useCallback(
    (presetKey: keyof typeof PRESETS) => {
      const preset = PRESETS[presetKey];
      form.setFieldsValue({
        screening_method: preset.screening_method,
        jamb_weight_percentage: preset.jamb_weight_percentage,
        school_weight_percentage: preset.school_weight_percentage,
        max_jamb_score: preset.max_jamb_score,
        max_school_score: preset.max_school_score,
      });
    },
    [form],
  );

  /**
   * Handle form submission (Req 8.8–8.14, 9.4–9.8)
   * Validates client-side, then calls create or update mutation
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      dispatch({
        type: ScoringStrategyFormActionType.SetFormError,
        message: null,
      });

      // Client-side validation (Req 8.8)
      const weightsSum =
        values.jamb_weight_percentage + values.school_weight_percentage;
      if (weightsSum !== 100) {
        const msg = "Weights must sum to 100%";
        dispatch({
          type: ScoringStrategyFormActionType.SetFormError,
          message: msg,
        });
        return;
      }

      if (values.screening_method === "JAMB_ONLY") {
        if (
          values.jamb_weight_percentage !== 100 ||
          values.school_weight_percentage !== 0
        ) {
          const msg = "JAMB Only requires 100% JAMB and 0% school";
          dispatch({
            type: ScoringStrategyFormActionType.SetFormError,
            message: msg,
          });
          return;
        }
      }

      if (values.max_jamb_score <= 0 || values.max_school_score <= 0) {
        const msg = "Max scores must be greater than 0";
        dispatch({
          type: ScoringStrategyFormActionType.SetFormError,
          message: msg,
        });
        return;
      }

      // Only validate referenceId in create mode or when scope is not GLOBAL
      const currentScope = isEditMode ? target.scope : values.scope;
      if (currentScope !== "GLOBAL" && !values.referenceId && !isEditMode) {
        const msg = "Reference is required for non-GLOBAL scopes";
        dispatch({
          type: ScoringStrategyFormActionType.SetFormError,
          message: msg,
        });
        return;
      }

      const strategyPayload: StrategyPayload = {
        screening_method: values.screening_method,
        jamb_weight_percentage: values.jamb_weight_percentage,
        school_weight_percentage: values.school_weight_percentage,
        max_jamb_score: values.max_jamb_score,
        max_school_score: values.max_school_score,
      };

      if (isEditMode) {
        // PUT: include scope and referenceId (immutable but required by API)
        await updateScoringStrategy({
          id: target.id,
          scope: target.scope,
          referenceId: target.referenceId,
          strategy: strategyPayload,
          description: values.description,
        }).unwrap();
        notification.success({
          message: "Scoring strategy updated successfully.",
        });
      } else {
        // POST: all fields including scope and referenceId (Req 8.9–8.14)
        await createScoringStrategy({
          scope: values.scope,
          referenceId: values.referenceId,
          strategy: strategyPayload,
          description: values.description,
        }).unwrap();
        notification.success({
          message: "Scoring strategy created successfully.",
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

  /**
   * Handle form cancellation (Req 8.10)
   * Reset state and close modal
   */
  const handleCancel = () => {
    reset();
    onClose();
  };

  return {
    state: {
      isEditMode,
      formError,
      isSubmitting,
      isJambOnly,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleMethodChange,
      handlePreset,
    },
    form,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Hook for managing the delete confirmation modal.
 *
 * Requirements: 10.1–10.8
 *
 * @param target - The strategy to delete
 * @param onClose - Callback to close the modal
 * @returns State and action handlers for the delete modal
 */
export function useDeleteScoringStrategyModal(
  target: AdmissionScoringStrategy | null,
  onClose: () => void,
) {
  const [deleteStrategy, { isLoading: isDeleting }] =
    useDeleteScoringStrategyMutation();
  const handleApiError = useApiError();

  // Check if this is the only GLOBAL strategy (Req 10.2)
  const { data: globalData } = useGetScoringStrategiesQuery(
    { "exact[scope]": "GLOBAL", itemsPerPage: 1 },
    { skip: target?.scope !== "GLOBAL" },
  );

  const isOnlyGlobal =
    target?.scope === "GLOBAL" && (globalData?.totalItems ?? 0) === 1;

  /**
   * Handle delete confirmation (Req 10.3–10.5)
   * Call mutation and handle success/error
   */
  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteStrategy(target.id).unwrap();
      notification.success({
        message: "Scoring strategy deleted successfully.",
      });
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "DELETE" },
      });
    }
  };

  /**
   * Handle delete cancellation (Req 10.6)
   * Close modal without deleting
   */
  const handleCancel = () => {
    onClose();
  };

  return {
    state: { isDeleting, isOnlyGlobal },
    actions: { handleConfirm, handleCancel },
  };
}

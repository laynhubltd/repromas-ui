// Feature: admission-config — Scoring Strategy modal hooks
// Requirements: 8.1–8.14, 9.1–9.10, 10.1–10.8, 16.2, 16.3

import { useApiError } from "@/shared/hooks/useApiError";
import {
  getDefaultComponentsForMethod,
  SCORING_STRATEGY_PRESET_CATALOG,
  STRATEGY_PRESETS,
  type StrategyPresetKey,
} from "@/shared/constants/scoringStrategyOptions";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useCallback, useReducer } from "react";
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
  LaneProfile,
  ScoringStrategyFormValues,
  ScreeningMethod,
} from "../types/scoring-strategy";
import { buildStrategyPayload } from "../utils/buildStrategyPayload";
import {
  defaultRequiresJamb,
  isJambWeightEditable,
  isMethodAllowedForLane,
  isMixedComponentMethod,
  isSchoolOnlyMethod,
  locksJambToZero,
  resolveLaneProfileFromStrategy,
} from "../utils/scoringStrategyDisplay";
import { validateStrategyPayload } from "../utils/validateStrategyPayload";

const CREATE_FORM_DEFAULTS: Partial<ScoringStrategyFormValues> = {
  scope: undefined,
  referenceId: null,
  laneProfile: "UTME_JAMB",
  screening_method: undefined,
  jamb_weight_percentage: 0,
  school_weight_percentage: 0,
  max_jamb_score: 400,
  max_school_score: 100,
  requires_jamb: true,
  components: undefined,
  description: undefined,
};

function applyMethodDefaults(
  laneProfile: LaneProfile,
  method: ScreeningMethod,
): Partial<ScoringStrategyFormValues> {
  if (method === "JAMB_ONLY") {
    return {
      screening_method: method,
      jamb_weight_percentage: 100,
      school_weight_percentage: 0,
      requires_jamb: true,
    };
  }

  if (isJambWeightEditable(laneProfile, method)) {
    return {
      screening_method: method,
      requires_jamb: defaultRequiresJamb(laneProfile, method),
      max_jamb_score: 400,
      components: undefined,
    };
  }

  if (locksJambToZero(laneProfile, method)) {
    const defaults: Partial<ScoringStrategyFormValues> = {
      screening_method: method,
      jamb_weight_percentage: 0,
      school_weight_percentage: 100,
      max_jamb_score: 0,
      requires_jamb: false,
    };

    if (method === "OLEVEL_ONLY") {
      defaults.max_school_score = 30;
      defaults.components = undefined;
    } else if (
      method === "POST_SCREENING_ONLY" ||
      method === "PRIOR_QUAL_ONLY"
    ) {
      defaults.max_school_score = 100;
      defaults.components = undefined;
    } else if (isMixedComponentMethod(method)) {
      defaults.max_school_score = 100;
      defaults.components = getDefaultComponentsForMethod(method);
    }

    return defaults;
  }

  return { screening_method: method };
}

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

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

  const [createScoringStrategy, { isLoading: isCreating }] =
    useCreateScoringStrategyMutation();
  const [updateScoringStrategy, { isLoading: isUpdating }] =
    useUpdateScoringStrategyMutation();
  const handleApiError = useApiError();

  const isSubmitting = isCreating || isUpdating;
  const laneProfile = Form.useWatch("laneProfile", form) as
    | LaneProfile
    | undefined;
  const screeningMethod = Form.useWatch("screening_method", form) as
    | ScreeningMethod
    | undefined;
  const requiresJamb = Form.useWatch("requires_jamb", form) as
    | boolean
    | undefined;

  const isJambOnly = screeningMethod === "JAMB_ONLY";
  const isMixed = screeningMethod
    ? isMixedComponentMethod(screeningMethod)
    : false;
  const isJambWeightsVisible =
    laneProfile && screeningMethod
      ? isJambWeightEditable(laneProfile, screeningMethod)
      : false;
  const showRequiresJambToggle = laneProfile === "UTME_OPEN";
  const showSchoolOnlyPreview =
    laneProfile && screeningMethod
      ? isSchoolOnlyMethod(laneProfile, screeningMethod) &&
        !isMixedComponentMethod(screeningMethod)
      : false;
  const showRenormalizeHelper =
    showRequiresJambToggle &&
    requiresJamb === false &&
    isJambWeightsVisible &&
    screeningMethod === "OLEVEL_GRADING";

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: ScoringStrategyFormActionType.Reset });
  }, [form]);

  const initializeForm = useCallback(() => {
    dispatch({
      type: ScoringStrategyFormActionType.SetFormError,
      message: null,
    });

    if (isEditMode && target) {
      const method = target.strategy.screening_method;
      const resolvedLane = resolveLaneProfileFromStrategy(target);
      form.setFieldsValue({
        scope: target.scope,
        referenceId: target.referenceId,
        laneProfile: resolvedLane,
        screening_method: method,
        jamb_weight_percentage: target.strategy.jamb_weight_percentage,
        school_weight_percentage: target.strategy.school_weight_percentage,
        max_jamb_score: target.strategy.max_jamb_score,
        max_school_score: target.strategy.max_school_score,
        requires_jamb:
          target.strategy.requires_jamb ??
          defaultRequiresJamb(resolvedLane, method),
        components: target.strategy.components ?? undefined,
        description: target.description || undefined,
      });
      return;
    }

    form.setFieldsValue(CREATE_FORM_DEFAULTS);
  }, [form, isEditMode, target]);

  const handleLaneChange = useCallback(
    (nextLane: LaneProfile) => {
      const currentMethod = form.getFieldValue("screening_method") as
        | ScreeningMethod
        | undefined;

      form.setFieldsValue({
        laneProfile: nextLane,
        screening_method: undefined,
        jamb_weight_percentage: 0,
        school_weight_percentage: 0,
        max_jamb_score: nextLane === "DIRECT_ENTRY" ? 0 : 400,
        max_school_score: 100,
        requires_jamb: defaultRequiresJamb(nextLane, "JAMB_ONLY"),
        components: undefined,
      });

      if (currentMethod && isMethodAllowedForLane(nextLane, currentMethod)) {
        form.setFieldsValue(applyMethodDefaults(nextLane, currentMethod));
      }
    },
    [form],
  );

  const handleMethodChange = useCallback(
    (method: ScreeningMethod) => {
      const currentLane =
        (form.getFieldValue("laneProfile") as LaneProfile) ?? "UTME_JAMB";
      form.setFieldsValue(applyMethodDefaults(currentLane, method));
    },
    [form],
  );

  const handlePreset = useCallback(
    (presetKey: StrategyPresetKey) => {
      const preset = STRATEGY_PRESETS[presetKey];
      const catalogItem = SCORING_STRATEGY_PRESET_CATALOG.find(
        (item) => item.key === presetKey,
      );

      form.setFieldsValue({
        laneProfile: catalogItem?.lane ?? form.getFieldValue("laneProfile"),
        screening_method: preset.screening_method,
        jamb_weight_percentage: preset.jamb_weight_percentage,
        school_weight_percentage: preset.school_weight_percentage,
        max_jamb_score: preset.max_jamb_score,
        max_school_score: preset.max_school_score,
        requires_jamb: preset.requires_jamb,
        components: preset.components ?? undefined,
      });
    },
    [form],
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      dispatch({
        type: ScoringStrategyFormActionType.SetFormError,
        message: null,
      });

      const currentScope = isEditMode ? target.scope : values.scope;
      if (currentScope !== "GLOBAL" && !values.referenceId && !isEditMode) {
        dispatch({
          type: ScoringStrategyFormActionType.SetFormError,
          message: "Reference is required for non-GLOBAL scopes",
        });
        return;
      }

      const resolvedLane = isEditMode
        ? resolveLaneProfileFromStrategy(target)
        : values.laneProfile;

      const strategyPayload = buildStrategyPayload(resolvedLane, {
        ...values,
        requires_jamb:
          values.requires_jamb ??
          defaultRequiresJamb(resolvedLane, values.screening_method),
      });

      const validation = validateStrategyPayload(resolvedLane, strategyPayload);
      if (!validation.valid) {
        dispatch({
          type: ScoringStrategyFormActionType.SetFormError,
          message: validation.message ?? "Invalid strategy configuration",
        });
        return;
      }

      if (isEditMode) {
        await updateScoringStrategy({
          id: target.id,
          scope: target.scope,
          referenceId: target.referenceId,
          strategy: strategyPayload,
          description: values.description,
        }).unwrap();
        notifyMutationSuccess(
          mutationSuccessMessage("Scoring strategy", "updated"),
        );
      } else {
        await createScoringStrategy({
          scope: values.scope,
          referenceId: values.referenceId,
          laneProfile: values.laneProfile,
          strategy: strategyPayload,
          description: values.description,
        }).unwrap();
        notifyMutationSuccess(
          mutationSuccessMessage("Scoring strategy", "created"),
        );
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
      formError,
      isSubmitting,
      isJambOnly,
      isMixed,
      isJambWeightsVisible,
      showRequiresJambToggle,
      showSchoolOnlyPreview,
      showRenormalizeHelper,
      laneProfile,
      screeningMethod,
      requiresJamb,
      open,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleMethodChange,
      handlePreset,
      handleLaneChange,
      initializeForm,
    },
    form,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteScoringStrategyModal(
  target: AdmissionScoringStrategy | null,
  onClose: () => void,
) {
  const [deleteStrategy, { isLoading: isDeleting }] =
    useDeleteScoringStrategyMutation();
  const handleApiError = useApiError();

  const { data: globalData } = useGetScoringStrategiesQuery(
    { "exact[scope]": "GLOBAL", itemsPerPage: 1 },
    { skip: target?.scope !== "GLOBAL" },
  );

  const isOnlyGlobal =
    target?.scope === "GLOBAL" && (globalData?.totalItems ?? 0) === 1;

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteStrategy(target.id).unwrap();
      notifyMutationSuccess(
        mutationSuccessMessage("Scoring strategy", "deleted"),
      );
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
    state: { isDeleting, isOnlyGlobal },
    actions: { handleConfirm, handleCancel },
  };
}

import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useCallback, useEffect, useReducer } from "react";
import {
  useCreateTransitionStatusMutation,
  useDeleteTransitionStatusMutation,
  useUpdateTransitionStatusMutation,
} from "../api/studentTransitionStatusApi";
import {
  TransitionStatusFormActionType,
  initialTransitionStatusFormState,
  transitionStatusFormReducer,
} from "../state/transitionStatusFormState";
import type {
  LevelProgression,
  ManagedBy,
  SemanticKind,
  StateCategory,
  StudentTransitionStatus,
} from "../types/student-transition-status";
import {
  SEMANTIC_KIND_LABELS,
  SEMANTIC_KIND_PRESETS,
  lintTransitionStatusCoherence,
} from "../utils/semanticKindPresentation";

export type TransitionStatusFormValues = {
  name: string;
  semanticKind: SemanticKind;
  managedBy: ManagedBy;
  stateCategory: StateCategory;
  levelProgression: LevelProgression;
  isTerminal: boolean;
  exemptFromEvaluation: boolean;
  countsTowardCareerCap: boolean;
  countsTowardsResidency: boolean;
  appearsOnBroadsheet: boolean;
  canRegisterCourses: boolean;
  canAccessPortal: boolean;
  isDefault: boolean;
};

export function useTransitionStatusFormModal(
  target: StudentTransitionStatus | null,
  open: boolean,
  onClose: () => void,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<TransitionStatusFormValues>();
  const [state, dispatch] = useReducer(
    transitionStatusFormReducer,
    initialTransitionStatusFormState,
  );
  const { isDefault, showCourseRegWarning, isInUse, semanticKind, managedBy, presetNote } =
    state;

  const [createTransitionStatus, { isLoading: isCreating }] =
    useCreateTransitionStatusMutation();
  const [updateTransitionStatus, { isLoading: isUpdating }] =
    useUpdateTransitionStatusMutation();
  const handleApiError = useApiError();

  const isLoading = isCreating || isUpdating;
  const isCurrentDefault = isEditMode && target.isDefault === true;
  const isDefaultSwitchDisabled = isCurrentDefault;

  // Watch form fields for live linting
  const watchedValues = Form.useWatch([], form);
  const coherenceWarnings = lintTransitionStatusCoherence(watchedValues ?? {});

  useEffect(() => {
    if (open) {
      if (target) {
        form.setFieldsValue({
          name: target.name,
          semanticKind: target.semanticKind ?? "OTHER",
          managedBy: target.managedBy ?? "BOTH",
          stateCategory: target.stateCategory,
          levelProgression: target.levelProgression ?? "RETAIN",
          isTerminal: target.isTerminal,
          exemptFromEvaluation: target.exemptFromEvaluation ?? false,
          countsTowardCareerCap: target.countsTowardCareerCap ?? true,
          countsTowardsResidency: target.countsTowardsResidency,
          appearsOnBroadsheet: target.appearsOnBroadsheet,
          canRegisterCourses: target.canRegisterCourses,
          canAccessPortal: target.canAccessPortal,
          isDefault: target.isDefault,
        });
        dispatch({
          type: TransitionStatusFormActionType.SetIsDefault,
          value: target.isDefault,
        });
        dispatch({
          type: TransitionStatusFormActionType.SetSemanticKind,
          value: target.semanticKind ?? "OTHER",
        });
        dispatch({
          type: TransitionStatusFormActionType.SetManagedBy,
          value: target.managedBy ?? "BOTH",
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          semanticKind: "OTHER",
          managedBy: "BOTH",
          stateCategory: "NEUTRAL",
          levelProgression: "RETAIN",
          isTerminal: false,
          exemptFromEvaluation: false,
          countsTowardCareerCap: true,
          countsTowardsResidency: true,
          appearsOnBroadsheet: true,
          canRegisterCourses: true,
          canAccessPortal: true,
          isDefault: false,
        });
        dispatch({ type: TransitionStatusFormActionType.Reset });
      }
    }
  }, [open, target, form]);

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: TransitionStatusFormActionType.Reset });
  }, [form]);

  const setIsInUse = useCallback((value: boolean) => {
    dispatch({ type: TransitionStatusFormActionType.SetIsInUse, value });
  }, []);

  const handleSemanticKindChange = useCallback(
    (kind: SemanticKind) => {
      dispatch({
        type: TransitionStatusFormActionType.SetSemanticKind,
        value: kind,
      });

      if (!isEditMode) {
        const preset = SEMANTIC_KIND_PRESETS[kind];
        if (preset) {
          form.setFieldsValue(preset);
          if (preset.managedBy) {
            dispatch({
              type: TransitionStatusFormActionType.SetManagedBy,
              value: preset.managedBy,
            });
          }
        }
        dispatch({
          type: TransitionStatusFormActionType.SetPresetNote,
          message:
            kind !== "OTHER"
              ? `Suggested settings applied for ${SEMANTIC_KIND_LABELS[kind]} — review before saving.`
              : null,
        });
      } else {
        dispatch({
          type: TransitionStatusFormActionType.SetPresetNote,
          message: "Review the settings below; they were not changed.",
        });
      }
    },
    [isEditMode, form],
  );

  const handleManagedByChange = useCallback(
    (value: ManagedBy) => {
      dispatch({
        type: TransitionStatusFormActionType.SetManagedBy,
        value,
      });
      form.setFieldValue("managedBy", value);
    },
    [form],
  );

  const dismissPresetNote = useCallback(() => {
    dispatch({
      type: TransitionStatusFormActionType.SetPresetNote,
      message: null,
    });
  }, []);

  const handleIsDefaultChange = useCallback(
    (value: boolean) => {
      if (isDefaultSwitchDisabled && !value) {
        return;
      }
      dispatch({
        type: TransitionStatusFormActionType.SetIsDefault,
        value,
      });
      form.setFieldValue("isDefault", value);
    },
    [form, isDefaultSwitchDisabled],
  );

  const handleCanRegisterCoursesChange = useCallback(
    (checked: boolean) => {
      if (isInUse && !checked && target?.canRegisterCourses === true) {
        dispatch({
          type: TransitionStatusFormActionType.SetShowCourseRegWarning,
          value: true,
        });
      } else {
        dispatch({
          type: TransitionStatusFormActionType.SetShowCourseRegWarning,
          value: false,
        });
      }
    },
    [isInUse, target?.canRegisterCourses],
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditMode) {
        await updateTransitionStatus({
          id: target.id,
          name: values.name.trim(),
          semanticKind: values.semanticKind,
          managedBy: values.managedBy,
          stateCategory: values.stateCategory,
          levelProgression: values.levelProgression,
          isTerminal: values.isTerminal,
          exemptFromEvaluation: values.exemptFromEvaluation,
          countsTowardCareerCap: values.countsTowardCareerCap,
          countsTowardsResidency: values.countsTowardsResidency,
          appearsOnBroadsheet: values.appearsOnBroadsheet,
          canRegisterCourses: values.canRegisterCourses,
          canAccessPortal: values.canAccessPortal,
          isDefault: values.isDefault,
        }).unwrap();
      } else {
        await createTransitionStatus({
          name: values.name.trim(),
          semanticKind: values.semanticKind,
          managedBy: values.managedBy,
          stateCategory: values.stateCategory,
          levelProgression: values.levelProgression,
          isTerminal: values.isTerminal,
          exemptFromEvaluation: values.exemptFromEvaluation,
          countsTowardCareerCap: values.countsTowardCareerCap,
          countsTowardsResidency: values.countsTowardsResidency,
          appearsOnBroadsheet: values.appearsOnBroadsheet,
          canRegisterCourses: values.canRegisterCourses,
          canAccessPortal: values.canAccessPortal,
          isDefault: values.isDefault,
        }).unwrap();
      }

      notifyMutationSuccess(
        mutationSuccessMessage(
          "Transition status",
          isEditMode ? "updated" : "created",
        ),
      );
      reset();
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
    reset();
    onClose();
  };

  return {
    state: {
      isLoading,
      isEditMode,
      isInUse,
      showCourseRegWarning,
      isDefault,
      isDefaultSwitchDisabled,
      semanticKind,
      managedBy,
      presetNote,
      coherenceWarnings,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleSemanticKindChange,
      handleManagedByChange,
      dismissPresetNote,
      handleCanRegisterCoursesChange,
      handleIsDefaultChange,
      setIsInUse,
    },
    form,
  };
}

export function useDeleteTransitionStatusModal(
  target: StudentTransitionStatus | null,
  usageCount: number,
  open: boolean,
  onClose: () => void,
) {
  const [deleteTransitionStatus, { isLoading }] =
    useDeleteTransitionStatusMutation();
  const handleApiError = useApiError();

  const isDefaultStatus = target?.isDefault === true;
  const isUsageBlocked = usageCount > 0;
  const isBlocked = isDefaultStatus || isUsageBlocked;

  void open;

  const handleConfirm = async () => {
    if (!target || isBlocked) return;
    try {
      await deleteTransitionStatus(target.id).unwrap();
      notifyMutationSuccess(
        mutationSuccessMessage("Transition status", "deleted"),
      );
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
    state: {
      isLoading,
      isBlocked,
      isDefaultStatus,
      isUsageBlocked,
      usageCount,
    },
    actions: {
      handleConfirm,
      handleCancel,
    },
  };
}

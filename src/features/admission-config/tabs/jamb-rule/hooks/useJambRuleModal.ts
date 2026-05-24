import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { Form, notification } from "antd";
import { useCallback, useEffect, useReducer } from "react";
import {
  useCreateJambCombinationGroupMutation,
  useCreateJambCombinationOptionMutation,
  useCreateJambSubjectCombinationMutation,
  useDeleteJambCombinationGroupMutation,
  useDeleteJambCombinationOptionMutation,
  useDeleteJambSubjectCombinationMutation,
  useGetJambSubjectCombinationsQuery,
  useUpdateJambCombinationGroupMutation,
  useUpdateJambCombinationOptionMutation,
  useUpdateJambSubjectCombinationMutation,
} from "../api/jambRuleApi";
import {
  initialJambRuleFormState,
  jambRuleFormReducer,
  JambRuleFormActionType,
} from "../state/jambRuleFormState";
import type {
  JambCombinationGroup,
  JambCombinationOption,
  JambRequirementType,
  JambScopeValue,
  JambSubjectCombination,
} from "../types/jamb-rule";

// ─── Combination Upsert ───────────────────────────────────────────────────────

type CombinationFormValues = {
  name: string;
  scope: JambScopeValue;
  referenceId: number | null;
  priorityWeight: number;
};

export function useJambCombinationFormModal(
  target: JambSubjectCombination | null,
  open: boolean,
  onClose: () => void,
  onCreated?: (combination: JambSubjectCombination) => void,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<CombinationFormValues>();
  const [modalState, dispatch] = useReducer(
    jambRuleFormReducer,
    initialJambRuleFormState,
  );
  const { formError } = modalState;

  const [createCombination, { isLoading: isCreating }] =
    useCreateJambSubjectCombinationMutation();
  const [updateCombination, { isLoading: isUpdating }] =
    useUpdateJambSubjectCombinationMutation();
  const handleApiError = useApiError();

  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (open && isEditMode && target) {
      form.setFieldsValue({
        name: target.name,
        scope: target.scope,
        referenceId: target.referenceId,
        priorityWeight: target.priorityWeight,
      });
    } else if (open && !isEditMode) {
      form.setFieldsValue({
        name: "",
        scope: undefined,
        referenceId: null,
        priorityWeight: 0,
      });
    }
  }, [open, isEditMode, target, form]);

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: JambRuleFormActionType.Reset });
  }, [form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      dispatch({ type: JambRuleFormActionType.SetFormError, message: null });

      if (values.scope === "GLOBAL" && values.referenceId != null) {
        dispatch({
          type: JambRuleFormActionType.SetFormError,
          message: "GLOBAL scope must not have a reference.",
        });
        return;
      }

      if (
        values.scope !== "GLOBAL" &&
        (values.referenceId == null || values.referenceId <= 0)
      ) {
        dispatch({
          type: JambRuleFormActionType.SetFormError,
          message: "Reference is required for scoped combinations.",
        });
        return;
      }

      if (values.priorityWeight < 0) {
        dispatch({
          type: JambRuleFormActionType.SetFormError,
          message: "Priority weight must be >= 0.",
        });
        return;
      }

      if (isEditMode && target) {
        await updateCombination({
          id: target.id,
          name: values.name.trim(),
          scope: target.scope,
          referenceId: target.referenceId,
          priorityWeight: values.priorityWeight,
        }).unwrap();
        notification.success({
          message: "JAMB combination updated successfully.",
        });
      } else {
        const created = await createCombination({
          name: values.name.trim(),
          scope: values.scope,
          referenceId: values.scope === "GLOBAL" ? null : values.referenceId,
          priorityWeight: values.priorityWeight,
        }).unwrap();
        notification.success({
          message: "JAMB combination created successfully.",
        });
        onCreated?.(created);
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
    state: { isEditMode, formError, isSubmitting },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

export function useDeleteJambCombinationModal(
  target: JambSubjectCombination | null,
  onClose: () => void,
  onDeleted?: () => void,
) {
  const [deleteCombination, { isLoading: isDeleting }] =
    useDeleteJambSubjectCombinationMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteCombination(target.id).unwrap();
      notification.success({
        message: "JAMB combination deleted. All groups and options were removed.",
      });
      onDeleted?.();
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

// ─── Group Upsert ─────────────────────────────────────────────────────────────

type GroupFormValues = {
  name: string;
  requirementType: JambRequirementType;
  requiredCount: number;
};

export function useJambGroupFormModal(
  target: JambCombinationGroup | null,
  combinationId: number | null,
  open: boolean,
  onClose: () => void,
  existingOptionCount = 0,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<GroupFormValues>();
  const [modalState, dispatch] = useReducer(
    jambRuleFormReducer,
    initialJambRuleFormState,
  );
  const { formError } = modalState;

  const [createGroup, { isLoading: isCreating }] =
    useCreateJambCombinationGroupMutation();
  const [updateGroup, { isLoading: isUpdating }] =
    useUpdateJambCombinationGroupMutation();
  const handleApiError = useApiError();

  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (open && isEditMode && target) {
      form.setFieldsValue({
        name: target.name,
        requirementType: target.requirementType,
        requiredCount: target.requiredCount,
      });
    } else if (open && !isEditMode) {
      form.setFieldsValue({
        name: "",
        requirementType: "COMPULSORY",
        requiredCount: 1,
      });
    }
  }, [open, isEditMode, target, form]);

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: JambRuleFormActionType.Reset });
  }, [form]);

  const handleSubmit = async () => {
    if (!isEditMode && combinationId == null) return;

    try {
      const values = await form.validateFields();
      dispatch({ type: JambRuleFormActionType.SetFormError, message: null });

      const requiredCount =
        values.requirementType === "COMPULSORY"
          ? 1
          : isEditMode
            ? values.requiredCount
            : 1;

      if (requiredCount < 1) {
        dispatch({
          type: JambRuleFormActionType.SetFormError,
          message: "Required count must be at least 1.",
        });
        return;
      }

      if (
        values.requirementType === "ANY_OF" &&
        isEditMode &&
        existingOptionCount > 0 &&
        requiredCount > existingOptionCount
      ) {
        dispatch({
          type: JambRuleFormActionType.SetFormError,
          message: `Required count cannot exceed ${existingOptionCount} (number of subjects in this group).`,
        });
        return;
      }

      if (
        values.requirementType === "ANY_OF" &&
        requiredCount > existingOptionCount &&
        isEditMode &&
        existingOptionCount === 0
      ) {
        dispatch({
          type: JambRuleFormActionType.SetFormError,
          message:
            "Add subjects to this group before raising the required count above 1.",
        });
        return;
      }

      if (isEditMode && target) {
        await updateGroup({
          id: target.id,
          combinationId: target.combinationId,
          name: values.name.trim(),
          requirementType: values.requirementType,
          requiredCount,
        }).unwrap();
        notification.success({ message: "Requirement group updated." });
      } else if (combinationId != null) {
        await createGroup({
          combinationId,
          name: values.name.trim(),
          requirementType: values.requirementType,
          requiredCount,
        }).unwrap();
        notification.success({ message: "Requirement group created." });
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
    state: { isEditMode, formError, isSubmitting },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

export function useDeleteJambGroupModal(
  target: JambCombinationGroup | null,
  onClose: () => void,
) {
  const [deleteGroup, { isLoading: isDeleting }] =
    useDeleteJambCombinationGroupMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteGroup(target.id).unwrap();
      notification.success({
        message: "Group deleted. All options in this group were removed.",
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

// ─── Option Upsert ──────────────────────────────────────────────────────────────

type OptionFormValues = {
  groupId: number;
  subjectId: number;
};

type OptionGroupContext = {
  requirementType: JambRequirementType;
  requiredCount: number;
  currentOptionCount: number;
};

export function useJambOptionFormModal(
  target: JambCombinationOption | null,
  presetGroupId: number | undefined,
  open: boolean,
  onClose: () => void,
  excludedSubjectIds: number[] = [],
  groupContext?: OptionGroupContext | null,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<OptionFormValues>();
  const [modalState, dispatch] = useReducer(
    jambRuleFormReducer,
    initialJambRuleFormState,
  );
  const { formError } = modalState;

  const [createOption, { isLoading: isCreating }] =
    useCreateJambCombinationOptionMutation();
  const [updateOption, { isLoading: isUpdating }] =
    useUpdateJambCombinationOptionMutation();
  const handleApiError = useApiError();

  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (open && isEditMode && target) {
      form.setFieldsValue({
        groupId: target.groupId,
        subjectId: target.subjectId,
      });
    } else if (open && !isEditMode) {
      form.setFieldsValue({
        groupId: presetGroupId,
        subjectId: undefined,
      });
    }
  }, [open, isEditMode, target, presetGroupId, form]);

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: JambRuleFormActionType.Reset });
  }, [form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      dispatch({ type: JambRuleFormActionType.SetFormError, message: null });

      if (
        !isEditMode &&
        excludedSubjectIds.includes(values.subjectId)
      ) {
        dispatch({
          type: JambRuleFormActionType.SetFormError,
          message: "This subject is already in the group.",
        });
        return;
      }

      if (
        !isEditMode &&
        groupContext?.requirementType === "ANY_OF" &&
        groupContext.requiredCount > groupContext.currentOptionCount + 1
      ) {
        dispatch({
          type: JambRuleFormActionType.SetFormError,
          message: `Required count (${groupContext.requiredCount}) is too high. Edit the group and lower required count to ${groupContext.currentOptionCount + 1} or less before adding another subject.`,
        });
        return;
      }

      if (isEditMode && target) {
        await updateOption({
          id: target.id,
          groupId: target.groupId,
          subjectId: values.subjectId,
        }).unwrap();
        notification.success({ message: "Subject option updated." });
      } else {
        await createOption({
          groupId: values.groupId,
          subjectId: values.subjectId,
        }).unwrap();
        notification.success({ message: "Subject option added." });
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
      excludedSubjectIds,
      isAddBlocked:
        !isEditMode &&
        groupContext?.requirementType === "ANY_OF" &&
        groupContext.requiredCount > groupContext.currentOptionCount + 1,
    },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

export function useDeleteJambOptionModal(
  target: JambCombinationOption | null,
  onClose: () => void,
) {
  const [deleteOption, { isLoading: isDeleting }] =
    useDeleteJambCombinationOptionMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteOption(target.id).unwrap();
      notification.success({ message: "Subject option removed." });
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

export function useJambGlobalRuleGuard(open: boolean, isCreateMode: boolean) {
  const { data: globalData } = useGetJambSubjectCombinationsQuery(
    { "exact[scope]": "GLOBAL", itemsPerPage: 1 },
    { skip: !open || !isCreateMode },
  );

  const hasExistingGlobal = (globalData?.totalItems ?? 0) > 0;

  return { hasExistingGlobal };
}

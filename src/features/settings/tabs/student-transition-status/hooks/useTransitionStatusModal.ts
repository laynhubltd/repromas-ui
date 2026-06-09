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
import type { StateCategory, StudentTransitionStatus } from "../types/student-transition-status";

type TransitionStatusFormValues = {
  name: string;
  stateCategory: StateCategory;
  isTerminal: boolean;
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
  const { isDefault, showCourseRegWarning, isInUse } = state;

  const [createTransitionStatus, { isLoading: isCreating }] =
    useCreateTransitionStatusMutation();
  const [updateTransitionStatus, { isLoading: isUpdating }] =
    useUpdateTransitionStatusMutation();
  const handleApiError = useApiError();

  const isLoading = isCreating || isUpdating;
  const isCurrentDefault = isEditMode && target.isDefault === true;
  const isDefaultSwitchDisabled = isCurrentDefault;

  useEffect(() => {
    if (open && target) {
      form.setFieldsValue({
        name: target.name,
        stateCategory: target.stateCategory,
        isTerminal: target.isTerminal,
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
    }
  }, [open, target, form]);

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: TransitionStatusFormActionType.Reset });
  }, [form]);

  const setIsInUse = useCallback((value: boolean) => {
    dispatch({ type: TransitionStatusFormActionType.SetIsInUse, value });
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
          stateCategory: values.stateCategory,
          isTerminal: values.isTerminal,
          countsTowardsResidency: values.countsTowardsResidency,
          appearsOnBroadsheet: values.appearsOnBroadsheet,
          canRegisterCourses: values.canRegisterCourses,
          canAccessPortal: values.canAccessPortal,
          isDefault: values.isDefault,
        }).unwrap();
      } else {
        await createTransitionStatus({
          name: values.name.trim(),
          stateCategory: values.stateCategory,
          isTerminal: values.isTerminal,
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
    },
    actions: {
      handleSubmit,
      handleCancel,
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

import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useEffect, useState } from "react";
import {
    useCreateTransitionStatusMutation,
    useDeleteTransitionStatusMutation,
    useUpdateTransitionStatusMutation,
} from "../api/studentTransitionStatusApi";
import type { StateCategory, StudentTransitionStatus } from "../types/student-transition-status";

// ─── Form field values shape ──────────────────────────────────────────────────

type TransitionStatusFormValues = {
  name: string;
  stateCategory: StateCategory;
  isTerminal: boolean;
  countsTowardsResidency: boolean;
  appearsOnBroadsheet: boolean;
  canRegisterCourses: boolean;
  canAccessPortal: boolean;
};

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

export function useTransitionStatusFormModal(
  target: StudentTransitionStatus | null,
  open: boolean,
  onClose: () => void
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<TransitionStatusFormValues>();
  const [createTransitionStatus, { isLoading: isCreating }] = useCreateTransitionStatusMutation();
  const [updateTransitionStatus, { isLoading: isUpdating }] = useUpdateTransitionStatusMutation();
  const handleApiError = useApiError();
  const [isInUse, setIsInUse] = useState(false);
  const [showCourseRegWarning, setShowCourseRegWarning] = useState(false);

  const isLoading = isCreating || isUpdating;

  // Pre-fill all 7 writable fields from target in edit mode
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
      });
      setIsInUse(false);
      setShowCourseRegWarning(false);
    }
    if (!open) {
      setIsInUse(false);
      setShowCourseRegWarning(false);
    }
  }, [open, target, form]);

  const handleCanRegisterCoursesChange = (checked: boolean) => {
    // Show warning when disabling course registration on an in-use status
    if (isInUse && !checked && target?.canRegisterCourses === true) {
      setShowCourseRegWarning(true);
    } else {
      setShowCourseRegWarning(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditMode) {
        // PUT always sends all 7 writable fields
        await updateTransitionStatus({
          id: target.id,
          name: values.name.trim(),
          stateCategory: values.stateCategory,
          isTerminal: values.isTerminal,
          countsTowardsResidency: values.countsTowardsResidency,
          appearsOnBroadsheet: values.appearsOnBroadsheet,
          canRegisterCourses: values.canRegisterCourses,
          canAccessPortal: values.canAccessPortal,
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
        }).unwrap();
      }

      notifyMutationSuccess(
        mutationSuccessMessage(
          "Transition status",
          isEditMode ? "updated" : "created",
        ),
      );
      form.resetFields();
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
    form.resetFields();
    setIsInUse(false);
    setShowCourseRegWarning(false);
    onClose();
  };

  return {
    state: {
      isLoading,
      isEditMode,
      isInUse,
      showCourseRegWarning,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleCanRegisterCoursesChange,
      setIsInUse,
    },
    form,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteTransitionStatusModal(
  target: StudentTransitionStatus | null,
  usageCount: number,
  open: boolean,
  onClose: () => void
) {
  const [deleteTransitionStatus, { isLoading }] = useDeleteTransitionStatusMutation();
  const handleApiError = useApiError();

  const isBlocked = usageCount > 0;

  void open;

  const handleConfirm = async () => {
    if (!target) return;
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
      usageCount,
    },
    actions: {
      handleConfirm,
      handleCancel,
    },
  };
}

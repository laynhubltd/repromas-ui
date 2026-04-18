import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { HttpStatusCode, parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
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
  const [formError, setFormError] = useState<string | null>(null);
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
      setFormError(null);

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

      form.resetFields();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);

      if (parsed.status === HttpStatusCode.Conflict) {
        // 409 — duplicate name: inline field error, modal stays open
        notification.error({ message: parsed.message });
        const detail = (parsed.raw as { detail?: string }).detail ?? parsed.message;
        if (detail.toLowerCase().includes("name") || detail.toLowerCase().includes("duplicate")) {
          form.setFields([{ name: "name", errors: [parsed.message] }]);
        } else {
          setFormError(parsed.message);
        }
        return;
      }

      if (isEditMode && parsed.status === HttpStatusCode.NotFound) {
        // 404 on PUT — close modal and notify
        notification.error({ message: parsed.message });
        onClose();
        return;
      }

      notification.error({ message: parsed.message });
      applyFormErrors(parsed, form, setFormError);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFormError(null);
    setIsInUse(false);
    setShowCourseRegWarning(false);
    onClose();
  };

  return {
    state: {
      formError,
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
  const [error, setError] = useState<string | null>(null);

  const isBlocked = usageCount > 0;

  useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteTransitionStatus(target.id).unwrap();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);

      if (parsed.status === HttpStatusCode.NotFound) {
        // 404 — close silently; list refetches via cache invalidation
        onClose();
        return;
      }

      // 409 or any other error — show inline error, modal stays open
      notification.error({ message: parsed.message });
      setError(parsed.message);
    }
  };

  const handleCancel = () => {
    setError(null);
    onClose();
  };

  return {
    state: {
      error,
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

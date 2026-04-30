import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
import {
    useCreateCourseAssessmentComponentMutation,
    useDeleteCourseAssessmentComponentMutation,
    useUpdateCourseAssessmentComponentMutation,
} from "../api/courseAssessmentComponentsApi";
import type { CourseAssessmentComponent } from "../types/course-assessment-policy";

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

type ComponentFormValues = {
  code: string;
  name: string;
  weightPercentage: number;
  isMandatoryToAttempt: boolean;
  mustPass: boolean;
  minPassPercentage: number | null;
  subComponents: unknown | null;
};

/**
 * Upsert hook for CourseAssessmentComponent form modal.
 * - target === null  → create mode (policyId is used for the new component)
 * - target !== null  → edit mode (policyId is read-only, derived from target)
 */
export function useComponentFormModal(
  policyId: number | null,
  target: CourseAssessmentComponent | null,
  open: boolean,
  onClose: () => void,
  _totalWeightPercentage?: number,
  _usedWeight?: number,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<ComponentFormValues>();
  const [createComponent, { isLoading: isCreating }] =
    useCreateCourseAssessmentComponentMutation();
  const [updateComponent, { isLoading: isUpdating }] =
    useUpdateCourseAssessmentComponentMutation();
  const [formError, setFormError] = useState<string | null>(null);

  // Conditional field state — watched to drive disabled/required logic in the form
  const [mustPassValue, setMustPassValue] = useState<boolean>(false);

  const isSubmitting = isCreating || isUpdating;

  // ─── Form lifecycle ──────────────────────────────────────────────────────

  // Pre-fill form in edit mode; reset conditional state on open
  useEffect(() => {
    if (open && target) {
      // Edit mode: pre-fill all mutable fields
      form.setFieldsValue({
        code: target.code,
        name: target.name,
        weightPercentage: target.weightPercentage,
        isMandatoryToAttempt: target.isMandatoryToAttempt,
        mustPass: target.mustPass,
        minPassPercentage: target.minPassPercentage,
        subComponents: target.subComponents,
      });
      setMustPassValue(target.mustPass);
    } else if (open && !target) {
      // Create mode: apply defaults
      form.setFieldsValue({
        isMandatoryToAttempt: true,
        mustPass: false,
      });
      setMustPassValue(false);
    }
    if (!open) {
      setFormError(null);
    }
  }, [open, target, form]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  // ─── Conditional field handlers ──────────────────────────────────────────

  /**
   * Called when the mustPass checkbox changes.
   * When unchecked, clear and disable minPassPercentage.
   */
  const handleMustPassToggle = (checked: boolean) => {
    setMustPassValue(checked);
    if (!checked) {
      form.setFieldsValue({ minPassPercentage: null });
    }
  };

  // ─── Submit ──────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormError(null);

      // Enforce conditional field nullification before submission
      const minPassPercentage = values.mustPass
        ? values.minPassPercentage
        : null;

      if (isEditMode) {
        await updateComponent({
          id: target.id,
          code: values.code,
          name: values.name,
          weightPercentage: values.weightPercentage,
          isMandatoryToAttempt: values.isMandatoryToAttempt,
          mustPass: values.mustPass,
          minPassPercentage,
          subComponents: values.subComponents ?? null,
        }).unwrap();
      } else {
        await createComponent({
          policyId: policyId!,
          code: values.code,
          name: values.name,
          weightPercentage: values.weightPercentage,
          isMandatoryToAttempt: values.isMandatoryToAttempt,
          mustPass: values.mustPass,
          minPassPercentage,
          subComponents: values.subComponents ?? null,
        }).unwrap();
      }

      form.resetFields();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      // 422 field-level errors and all other errors
      applyFormErrors(parsed, form, setFormError);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setFormError(null);
    onClose();
  };

  return {
    state: {
      isEditMode,
      isSubmitting,
      formError,
      mustPassValue,
    },
    actions: {
      handleSubmit,
      handleClose,
      handleMustPassToggle,
    },
    form,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete hook for CourseAssessmentComponent modal.
 *
 * @param target            - the component to delete (null when modal is closed)
 * @param isLastComponent   - whether this is the last component in the policy
 * @param open              - whether the modal is open
 * @param onClose           - callback to close the modal
 */
export function useDeleteComponentModal(
  target: CourseAssessmentComponent | null,
  isLastComponent: boolean,
  open: boolean,
  onClose: () => void,
) {
  const [deleteComponent, { isLoading: isDeleting }] =
    useDeleteCourseAssessmentComponentMutation();
  const [error, setError] = useState<string | null>(null);

  // Reset error when modal opens/closes
  useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteComponent(target.id).unwrap();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
      setError(parsed.message);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  // isLastComponent is accepted as a parameter so the modal can display the
  // "last component" warning; it is not used in the hook logic itself but is
  // part of the public API.
  void isLastComponent;

  return {
    state: {
      isDeleting,
      error,
    },
    actions: {
      handleConfirm,
      handleClose,
    },
  };
}

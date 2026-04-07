import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
import {
    useCreateGraduationRequirementMutation,
    useDeleteGraduationRequirementMutation,
    useUpdateGraduationRequirementMutation,
} from "../api/graduationRequirementsApi";
import type { ProgramGraduationRequirement } from "../types/graduation-requirement";

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

/**
 * Upsert hook for GraduationRequirement form modal.
 * - target === null  → create mode
 * - target !== null  → edit mode (PUT body excludes programId/curriculumVersionId)
 */
export function useGraduationRequirementFormModal(
  target: ProgramGraduationRequirement | null,
  open: boolean,
  onClose: () => void,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm();
  const [createRequirement, { isLoading: isCreating }] = useCreateGraduationRequirementMutation();
  const [updateRequirement, { isLoading: isUpdating }] = useUpdateGraduationRequirementMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const isLoading = isCreating || isUpdating;

  // Pre-fill form in edit mode
  useEffect(() => {
    if (open && target) {
      form.setFieldsValue({
        programId: target.programId,
        curriculumVersionId: target.curriculumVersionId,
        entryMode: target.entryMode,
        minTotalCredits: target.minTotalCredits,
        minCoreCredits: target.minCoreCredits,
        minElectiveCredits: target.minElectiveCredits,
      });
    }
    if (!open) {
      setFormError(null);
    }
  }, [open, target, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormError(null);
      if (isEditMode) {
        await updateRequirement({
          id: target.id,
          curriculumVersionId: values.curriculumVersionId,
          entryMode: values.entryMode,
          minTotalCredits: values.minTotalCredits,
          minCoreCredits: values.minCoreCredits,
          minElectiveCredits: values.minElectiveCredits,
        }).unwrap();
      } else {
        await createRequirement({
          programId: values.programId,
          curriculumVersionId: values.curriculumVersionId,
          entryMode: values.entryMode,
          minTotalCredits: values.minTotalCredits,
          minCoreCredits: values.minCoreCredits,
          minElectiveCredits: values.minElectiveCredits,
        }).unwrap();
      }
      form.resetFields();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
      applyFormErrors(parsed, form, setFormError);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFormError(null);
    onClose();
  };

  return {
    state: { formError, isLoading, isEditMode },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete hook for GraduationRequirement modal.
 * Note: not-found on DELETE returns HTTP 400 (not 404) — handled uniformly by parseApiError.
 */
export function useDeleteGraduationRequirementModal(
  target: ProgramGraduationRequirement | null,
  onClose: () => void,
) {
  const [deleteRequirement, { isLoading }] = useDeleteGraduationRequirementMutation();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteRequirement(target.id).unwrap();
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
    state: { error, isLoading },
    actions: { handleConfirm, handleCancel },
  };
}

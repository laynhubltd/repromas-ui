import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useEffect } from "react";
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
  const handleApiError = useApiError();

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
  }, [open, target, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
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
      notifyMutationSuccess(
        mutationSuccessMessage(
          "Graduation requirement",
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
    onClose();
  };

  return {
    state: { isLoading, isEditMode },
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
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteRequirement(target.id).unwrap();
      notifyMutationSuccess(
        mutationSuccessMessage("Graduation requirement", "deleted"),
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
    state: { isLoading },
    actions: { handleConfirm, handleCancel },
  };
}

import type { PriorQualificationType } from "@/features/admission-config/tabs/qualification-type/types/prior-qualification-type";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useCallback, useEffect } from "react";
import {
  useCreateProgramPriorQualificationRequirementMutation,
  useDeleteProgramPriorQualificationRequirementMutation,
  useUpdateProgramPriorQualificationRequirementMutation,
} from "../api/programPriorQualificationRequirementApi";
import type {
  ProgramPriorQualificationRequirement,
  ProgramPriorQualRequirementFormValues,
} from "../types/program-prior-qualification-requirement";
import {
  buildCreateRequirementPayload,
  buildUpdateRequirementPayload,
  validateRequirementThreshold,
} from "../utils/buildRequirementPayload";
import { intentFromRequirement } from "../utils/requirementRuleIntent";

function formValuesFromRequirement(
  target: ProgramPriorQualificationRequirement,
): ProgramPriorQualRequirementFormValues {
  return {
    programId: target.programId,
    priorQualificationTypeId: target.priorQualificationTypeId,
    ruleIntent: intentFromRequirement(target),
    groupMode: target.requirementGroup ? "or" : "standalone",
    requirementGroup: target.requirementGroup,
    minimumPoints: target.minimumPoints ?? undefined,
    minimumClass: target.minimumClass ?? undefined,
    minimumClassRank: target.minimumClassRank ?? undefined,
    entryLevelId: target.entryLevelId ?? undefined,
    isMandatory: target.isMandatory,
  };
}

export function useProgramPriorQualRequirementFormModal(
  target: ProgramPriorQualificationRequirement | null,
  open: boolean,
  onClose: () => void,
  presetProgramId: number | undefined,
  getUsedTypeIdsForProgram: (programId: number | undefined) => number[],
  qualificationTypes: PriorQualificationType[],
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<ProgramPriorQualRequirementFormValues>();
  const handleApiError = useApiError();

  const [createRequirement, { isLoading: isCreating }] =
    useCreateProgramPriorQualificationRequirementMutation();
  const [updateRequirement, { isLoading: isUpdating }] =
    useUpdateProgramPriorQualificationRequirementMutation();

  const isSubmitting = isCreating || isUpdating;
  const programLocked = isEditMode || presetProgramId !== undefined;
  const typeLocked = isEditMode;

  useEffect(() => {
    if (!open) return;

    if (isEditMode && target) {
      form.setFieldsValue(formValuesFromRequirement(target));
    } else {
      form.resetFields();
      form.setFieldsValue({
        programId: presetProgramId,
        ruleIntent: "must_have",
        groupMode: "standalone",
        requirementGroup: null,
        isMandatory: true,
      });
    }
  }, [open, isEditMode, target, presetProgramId, form]);

  const reset = useCallback(() => {
    form.resetFields();
  }, [form]);

  const handleSubmit = useCallback(
    async (values: ProgramPriorQualRequirementFormValues) => {
      const selectedType =
        target?.priorQualificationType ??
        qualificationTypes.find((type) => type.id === values.priorQualificationTypeId) ??
        null;
      const format = selectedType?.assessmentFormat;

      if (
        !isEditMode &&
        getUsedTypeIdsForProgram(values.programId).includes(values.priorQualificationTypeId)
      ) {
        form.setFields([
          {
            name: "priorQualificationTypeId",
            errors: ["This qualification type is already configured for the program."],
          },
        ]);
        return;
      }

      const maxPoints =
        selectedType?.assessmentFormat === "POINTS"
          ? (selectedType.scaleDefinition as { maxPoints?: number }).maxPoints
          : undefined;

      const thresholdValidation = validateRequirementThreshold(format, values, maxPoints);

      if (!thresholdValidation.valid) {
        form.setFields([
          {
            name: "minimumPoints",
            errors: [thresholdValidation.message],
          },
        ]);
        return;
      }

      try {
        if (isEditMode && target) {
          const payload = buildUpdateRequirementPayload(values, format, target);
          await updateRequirement(payload).unwrap();
          notifyMutationSuccess(
            mutationSuccessMessage("Program Prior Qual Requirement", "updated"),
          );
        } else {
          const payload = buildCreateRequirementPayload(values, format);
          await createRequirement(payload).unwrap();
          notifyMutationSuccess(
            mutationSuccessMessage("Program Prior Qual Requirement", "created"),
          );
        }
        reset();
        onClose();
      } catch (err: unknown) {
        handleApiError(err, {
          context: {
            screen: RequestScreen.Modal,
            method: isEditMode ? "PUT" : "POST",
          },
          form,
        });
      }
    },
    [
      isEditMode,
      target,
      getUsedTypeIdsForProgram,
      qualificationTypes,
      createRequirement,
      updateRequirement,
      reset,
      onClose,
      handleApiError,
      form,
    ],
  );

  const handleCancel = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  return {
    state: {
      isEditMode,
      isSubmitting,
      programLocked,
      typeLocked,
    },
    actions: {
      handleSubmit,
      handleCancel,
    },
    form,
  };
}

export function useDeleteProgramPriorQualRequirementModal(
  target: ProgramPriorQualificationRequirement | null,
  onClose: () => void,
) {
  const [deleteRequirement, { isLoading: isDeleting }] =
    useDeleteProgramPriorQualificationRequirementMutation();
  const handleApiError = useApiError();

  const handleConfirm = useCallback(async () => {
    if (!target) return;
    try {
      await deleteRequirement(target.id).unwrap();
      notifyMutationSuccess(
        mutationSuccessMessage("Program Prior Qual Requirement", "deleted"),
      );
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "DELETE" },
      });
    }
  }, [target, deleteRequirement, onClose, handleApiError]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return {
    state: { isDeleting },
    actions: { handleConfirm, handleCancel },
  };
}

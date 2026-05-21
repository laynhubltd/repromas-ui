import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useCallback, useEffect, useReducer, useState } from "react";
import {
  useCreateProgramOlevelRequirementMutation,
  useDeleteProgramOlevelRequirementMutation,
  useUpdateProgramOlevelRequirementMutation,
} from "../api/programOlevelRuleApi";
import {
  initialProgramOlevelRuleFormState,
  programOlevelRuleFormReducer,
  ProgramOlevelRuleFormActionType,
} from "../state/programOlevelRuleFormState";
import type { ProgramOlevelRequirement } from "../types/program-olevel-rule";

type ProgramOlevelRuleFormValues = {
  programId: number;
  subjectId: number;
  isCompulsory: boolean;
};

export function useProgramOlevelRuleFormModal(
  target: ProgramOlevelRequirement | null,
  open: boolean,
  onClose: () => void,
  presetProgramId: number | undefined,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<ProgramOlevelRuleFormValues>();
  const [modalState, dispatch] = useReducer(
    programOlevelRuleFormReducer,
    initialProgramOlevelRuleFormState,
  );
  const { formError } = modalState;

  const [createRequirement, { isLoading: isCreating }] =
    useCreateProgramOlevelRequirementMutation();
  const [updateRequirement, { isLoading: isUpdating }] =
    useUpdateProgramOlevelRequirementMutation();

  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (open && isEditMode && target) {
      form.setFieldsValue({
        programId: target.programId,
        subjectId: target.subjectId,
        isCompulsory: target.isCompulsory,
      });
    } else if (open && !isEditMode) {
      form.setFieldsValue({
        programId: presetProgramId,
        subjectId: undefined,
        isCompulsory: true,
      });
    }
  }, [open, isEditMode, target, presetProgramId, form]);

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: ProgramOlevelRuleFormActionType.Reset });
  }, [form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      dispatch({
        type: ProgramOlevelRuleFormActionType.SetFormError,
        message: null,
      });

      const programId = values.programId;
      const subjectId = values.subjectId;
      const isCompulsory = values.isCompulsory ?? true;

      if (isEditMode && target) {
        await updateRequirement({
          id: target.id,
          programId,
          subjectId,
          isCompulsory,
        }).unwrap();

        notification.success({
          message: "Program O'Level requirement updated successfully.",
        });
      } else {
        await createRequirement({
          programId,
          subjectId,
          isCompulsory,
        }).unwrap();

        notification.success({
          message: "Program O'Level requirement created successfully.",
        });
      }

      reset();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
      applyFormErrors(parsed, form, (msg) =>
        dispatch({
          type: ProgramOlevelRuleFormActionType.SetFormError,
          message: msg,
        }),
      );
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
      programLocked: isEditMode || presetProgramId !== undefined,
    },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

export function useDeleteProgramOlevelRuleModal(
  target: ProgramOlevelRequirement | null,
  _open: boolean,
  onClose: () => void,
) {
  const [deleteRequirement, { isLoading: isDeleting }] =
    useDeleteProgramOlevelRequirementMutation();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteRequirement(target.id).unwrap();
      notification.success({
        message: "Program O'Level requirement removed successfully.",
      });
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
    state: { error, isDeleting },
    actions: { handleConfirm, handleCancel },
  };
}

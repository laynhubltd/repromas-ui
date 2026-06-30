import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useCallback, useEffect, useReducer } from "react";
import {
  useCreatePriorQualificationTypeMutation,
  useDeletePriorQualificationTypeMutation,
  useUpdatePriorQualificationTypeMutation,
} from "../api/priorQualificationTypeApi";
import {
  QualificationTypeFormActionType,
  initialQualificationTypeFormState,
  qualificationTypeFormReducer,
} from "../state/qualificationTypeFormState";
import type {
  PriorQualificationType,
  QualificationTypeFormValues,
} from "../types/prior-qualification-type";
import {
  buildCreateQualificationTypePayload,
  buildUpdateQualificationTypePayload,
  defaultFormValuesForFormat,
  formValuesFromQualificationType,
} from "../utils/buildQualificationTypePayload";
import { normalizeQualificationTypeCode } from "../utils/normalizeQualificationTypeCode";

export function useQualificationTypeFormModal(
  target: PriorQualificationType | null,
  open: boolean,
  onClose: () => void,
) {
  const [formState, dispatch] = useReducer(
    qualificationTypeFormReducer,
    initialQualificationTypeFormState,
  );
  const [form] = Form.useForm<QualificationTypeFormValues>();
  const handleApiError = useApiError();

  const isEditMode = target !== null;
  const assessmentFormat = Form.useWatch("assessmentFormat", form);
  const loadedFormat = target?.assessmentFormat;

  const [createType, { isLoading: isCreating }] =
    useCreatePriorQualificationTypeMutation();
  const [updateType, { isLoading: isUpdating }] =
    useUpdatePriorQualificationTypeMutation();

  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;

    if (isEditMode && target) {
      form.setFieldsValue(formValuesFromQualificationType(target));
    } else {
      form.resetFields();
      form.setFieldsValue({
        assessmentFormat: "POINTS",
        isActive: true,
        ...defaultFormValuesForFormat("POINTS"),
      });
    }
  }, [open, isEditMode, target, form]);

  const reset = useCallback(() => {
    dispatch({ type: QualificationTypeFormActionType.Reset });
    form.resetFields();
  }, [form]);

  const handleAssessmentFormatChange = useCallback(
    (format: QualificationTypeFormValues["assessmentFormat"]) => {
      form.setFieldsValue(defaultFormValuesForFormat(format));
    },
    [form],
  );

  const handleSubmit = useCallback(
    async (values: QualificationTypeFormValues) => {
      try {
        if (isEditMode && target) {
          const payload = buildUpdateQualificationTypePayload(values, target);
          await updateType({ id: target.id, ...payload }).unwrap();
          notifyMutationSuccess(
            mutationSuccessMessage("Qualification Type", "updated"),
          );
        } else {
          const payload = buildCreateQualificationTypePayload(values);
          await createType(payload).unwrap();
          notifyMutationSuccess(
            mutationSuccessMessage("Qualification Type", "created"),
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
      createType,
      updateType,
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

  const handleCodePreview = useCallback(
    (code: string) => normalizeQualificationTypeCode(code),
    [],
  );

  const formatChanged =
    isEditMode &&
    loadedFormat != null &&
    assessmentFormat != null &&
    assessmentFormat !== loadedFormat;

  return {
    state: {
      isEditMode,
      formError: formState.formError,
      isSubmitting,
      assessmentFormat,
      formatChanged,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleAssessmentFormatChange,
      handleCodePreview,
    },
    form,
  };
}

export function useDeleteQualificationTypeModal(
  target: PriorQualificationType | null,
  onClose: () => void,
) {
  const [deleteType, { isLoading: isDeleting }] =
    useDeletePriorQualificationTypeMutation();
  const handleApiError = useApiError();

  const handleConfirm = useCallback(async () => {
    if (!target) return;
    try {
      await deleteType(target.id).unwrap();
      notifyMutationSuccess(
        mutationSuccessMessage("Qualification Type", "deleted"),
      );
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "DELETE" },
      });
    }
  }, [target, deleteType, onClose, handleApiError]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return {
    state: { isDeleting },
    actions: { handleConfirm, handleCancel },
  };
}

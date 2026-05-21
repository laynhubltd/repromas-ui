import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useCallback, useEffect, useReducer, useState } from "react";
import {
  useCreateOlevelSubjectMutation,
  useDeleteOlevelSubjectMutation,
  useUpdateOlevelSubjectMutation,
} from "../api/olevelSubjectApi";
import {
  initialOlevelSubjectFormState,
  olevelSubjectFormReducer,
  OlevelSubjectFormActionType,
} from "../state/olevelSubjectFormState";
import type { OlevelSubject } from "../types/olevel-subject";

type OlevelSubjectFormValues = {
  name: string;
  code?: string;
};

export function useOlevelSubjectFormModal(
  target: OlevelSubject | null,
  open: boolean,
  onClose: () => void,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<OlevelSubjectFormValues>();
  const [modalState, dispatch] = useReducer(
    olevelSubjectFormReducer,
    initialOlevelSubjectFormState,
  );
  const { formError } = modalState;

  const [createOlevelSubject, { isLoading: isCreating }] =
    useCreateOlevelSubjectMutation();
  const [updateOlevelSubject, { isLoading: isUpdating }] =
    useUpdateOlevelSubjectMutation();

  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (open && isEditMode && target) {
      form.setFieldsValue({
        name: target.name,
        code: target.code ?? undefined,
      });
    } else if (open && !isEditMode) {
      form.setFieldsValue({ name: undefined, code: undefined });
    }
  }, [open, isEditMode, target, form]);

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: OlevelSubjectFormActionType.Reset });
  }, [form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      dispatch({
        type: OlevelSubjectFormActionType.SetFormError,
        message: null,
      });

      const name = values.name.trim();
      const code =
        values.code !== undefined && values.code !== ""
          ? values.code.trim()
          : null;

      if (isEditMode && target) {
        await updateOlevelSubject({
          id: target.id,
          name,
          code,
        }).unwrap();
        notification.success({
          message: "O'Level subject updated successfully.",
        });
      } else {
        await createOlevelSubject({ name, code }).unwrap();
        notification.success({
          message: "O'Level subject created successfully.",
        });
      }

      reset();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
      applyFormErrors(parsed, form, (msg) =>
        dispatch({
          type: OlevelSubjectFormActionType.SetFormError,
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
    state: { isEditMode, formError, isSubmitting },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

export function useDeleteOlevelSubjectModal(
  target: OlevelSubject | null,
  _open: boolean,
  onClose: () => void,
) {
  const [deleteOlevelSubject, { isLoading: isDeleting }] =
    useDeleteOlevelSubjectMutation();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deleteOlevelSubject(target.id).unwrap();
      notification.success({
        message: "O'Level subject deleted successfully.",
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

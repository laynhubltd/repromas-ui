import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { Form, notification } from "antd";
import { useCallback, useEffect } from "react";
import {
  useCreateOlevelSubjectMutation,
  useDeleteOlevelSubjectMutation,
  useUpdateOlevelSubjectMutation,
} from "../api/olevelSubjectApi";
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

  const [createOlevelSubject, { isLoading: isCreating }] =
    useCreateOlevelSubjectMutation();
  const [updateOlevelSubject, { isLoading: isUpdating }] =
    useUpdateOlevelSubjectMutation();
  const handleApiError = useApiError();

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
  }, [form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

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
      handleApiError(err, {
        context: {
          screen: RequestScreen.Modal,
          method: isEditMode ? "PATCH" : "POST",
        },
        form,
      });
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return {
    state: { isEditMode, isSubmitting },
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
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteOlevelSubject(target.id).unwrap();
      notification.success({
        message: "O'Level subject deleted successfully.",
      });
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
    state: { isDeleting },
    actions: { handleConfirm, handleCancel },
  };
}

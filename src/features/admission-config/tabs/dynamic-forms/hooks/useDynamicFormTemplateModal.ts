import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useCallback, useEffect } from "react";
import {
  useCreateDynamicFormMutation,
  useUpdateDynamicFormMutation,
} from "../api/dynamicFormAdminApi";
import type { FormPurpose, FormTemplate } from "@/features/dynamic-form/types";

type TemplateFormValues = {
  code: string;
  name: string;
  description?: string;
  purpose: FormPurpose;
};

export function useDynamicFormTemplateModal(
  target: FormTemplate | null,
  open: boolean,
  onClose: () => void,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<TemplateFormValues>();
  const [createForm, { isLoading: isCreating }] = useCreateDynamicFormMutation();
  const [updateForm, { isLoading: isUpdating }] = useUpdateDynamicFormMutation();
  const handleApiError = useApiError();

  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;
    if (isEditMode && target) {
      form.setFieldsValue({
        code: target.code,
        name: target.name,
        description: target.description ?? undefined,
        purpose: target.purpose,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ purpose: "ADMISSION_APPLICATION" });
    }
  }, [open, isEditMode, target, form]);

  const reset = useCallback(() => {
    form.resetFields();
  }, [form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (isEditMode && target) {
        await updateForm({
          id: target.id,
          name: values.name.trim(),
          description: values.description?.trim() || null,
        }).unwrap();
        notifyMutationSuccess(mutationSuccessMessage("Form template", "updated"));
      } else {
        await createForm({
          code: values.code.trim(),
          name: values.name.trim(),
          purpose: values.purpose,
          description: values.description?.trim() || null,
        }).unwrap();
        notifyMutationSuccess(mutationSuccessMessage("Form template", "created"));
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
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return {
    state: { isLoading, isEditMode },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

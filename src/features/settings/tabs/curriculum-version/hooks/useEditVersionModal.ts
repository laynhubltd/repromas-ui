import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { Form, notification } from "antd";
import { useEffect } from "react";
import { useUpdateCurriculumVersionMutation } from "../api/curriculumVersionApi";
import type { CurriculumVersion } from "../types/curriculum-version";

export function useEditVersionModal(target: CurriculumVersion | null, open: boolean, onClose: () => void) {
  const [form] = Form.useForm<{ name: string }>();
  const [updateCurriculumVersion, { isLoading }] = useUpdateCurriculumVersionMutation();
  const handleApiError = useApiError();

  useEffect(() => {
    if (open && target) {
      form.setFieldsValue({ name: target.name });
    }
  }, [open, target, form]);

  const handleSubmit = async () => {
    if (!target) return;
    try {
      const values = await form.validateFields();
      await updateCurriculumVersion({ id: target.id, name: values.name.trim() }).unwrap();
      notification.success({ message: "Version updated successfully" });
      form.resetFields();
      window.dispatchEvent(new CustomEvent("curriculumVersionUpdated"));
      onClose();
    } catch (err: unknown) {
      const decision = handleApiError(err, {
        context: { screen: RequestScreen.Modal, method: "PATCH" },
        form,
      });
      if (decision.disableForm) {
        onClose();
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return {
    state: { isLoading },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

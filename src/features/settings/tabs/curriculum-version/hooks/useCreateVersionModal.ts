import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useState } from "react";
import { useCreateCurriculumVersionMutation } from "../api/curriculumVersionApi";

export function useCreateVersionModal(onClose: () => void) {
  const [form] = Form.useForm<{ name: string }>();
  const [createCurriculumVersion, { isLoading }] = useCreateCurriculumVersionMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormError(null);
      await createCurriculumVersion({ name: values.name.trim() }).unwrap();
      notification.success({ message: "Version created successfully" });
      form.resetFields();
      window.dispatchEvent(new CustomEvent("curriculumVersionCreated"));
      onClose();
    } catch (err: unknown) {
      applyFormErrors(parseApiError(err), form, setFormError);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFormError(null);
    onClose();
  };

  return {
    state: { formError, isLoading },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

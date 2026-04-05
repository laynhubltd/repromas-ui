import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
import { useUpdateCurriculumVersionMutation } from "../api/curriculumVersionApi";
import type { CurriculumVersion } from "../types/curriculum-version";

export function useEditVersionModal(target: CurriculumVersion | null, open: boolean, onClose: () => void) {
  const [form] = Form.useForm<{ name: string }>();
  const [updateCurriculumVersion, { isLoading }] = useUpdateCurriculumVersionMutation();
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open && target) {
      form.setFieldsValue({ name: target.name });
    }
  }, [open, target, form]);

  const handleSubmit = async () => {
    if (!target) return;
    try {
      const values = await form.validateFields();
      setFormError(null);
      await updateCurriculumVersion({ id: target.id, name: values.name.trim() }).unwrap();
      notification.success({ message: "Version updated successfully" });
      form.resetFields();
      window.dispatchEvent(new CustomEvent("curriculumVersionUpdated"));
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

import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { Form, notification } from "antd";
import { useCreateCurriculumVersionMutation } from "../api/curriculumVersionApi";

export function useCreateVersionModal(onClose: () => void) {
  const [form] = Form.useForm<{ name: string }>();
  const [createCurriculumVersion, { isLoading }] = useCreateCurriculumVersionMutation();
  const handleApiError = useApiError();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createCurriculumVersion({ name: values.name.trim() }).unwrap();
      notification.success({ message: "Version created successfully" });
      form.resetFields();
      window.dispatchEvent(new CustomEvent("curriculumVersionCreated"));
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Modal, method: "POST" },
        form,
      });
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

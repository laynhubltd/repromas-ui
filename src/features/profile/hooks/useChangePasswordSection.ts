import { useChangePasswordMutation } from "@/features/auth/api/auth-api";
import type { ChangePasswordFormValues } from "@/features/auth/types/change-password";
import { PROFILE_CHANGE_PASSWORD_SUCCESS } from "@/shared/constants/profilePageOptions";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useCallback } from "react";

export function useChangePasswordSection() {
  const [form] = Form.useForm<ChangePasswordFormValues>();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const handleApiError = useApiError();

  const handleSubmit = useCallback(
    async (values: ChangePasswordFormValues) => {
      try {
        await changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }).unwrap();

        notifyMutationSuccess(PROFILE_CHANGE_PASSWORD_SUCCESS);
        form.resetFields();
      } catch (err: unknown) {
        handleApiError(err, {
          context: { screen: RequestScreen.Form, method: "POST" },
          form,
        });
      }
    },
    [changePassword, form, handleApiError],
  );

  return {
    state: { form },
    actions: { handleSubmit },
    flags: { isLoading },
  };
}

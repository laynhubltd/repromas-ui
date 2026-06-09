import { appPaths } from "@/app/routing/app-path";
import { useResetPasswordMutation } from "@/features/auth/api/auth-api";
import { resolveResetTokenError } from "@/features/auth/utils/resolveResetTokenError";
import { PASSWORD_RESET_SUCCESS_MESSAGE } from "@/shared/constants/passwordResetOptions";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form } from "antd";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function useResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<{ newPassword: string; confirmPassword: string }>();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const handleApiError = useApiError();
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [submitSucceeded, setSubmitSucceeded] = useState(false);

  const tokenMissing = !token || token.trim().length === 0;

  const handleSubmit = useCallback(
    async (values: { newPassword: string }) => {
      if (!token) {
        return;
      }

      setTokenError(null);

      try {
        await resetPassword({
          token,
          newPassword: values.newPassword,
        }).unwrap();

        setSubmitSucceeded(true);
        notifyMutationSuccess(PASSWORD_RESET_SUCCESS_MESSAGE);
        navigate(appPaths.login, { replace: true });
      } catch (err: unknown) {
        const parsed = parseApiError(err);

        if (parsed.status === 400) {
          setTokenError(resolveResetTokenError(parsed.message));
          return;
        }

        handleApiError(err, {
          context: { screen: RequestScreen.Form, method: "POST" },
          form,
        });
      }
    },
    [token, resetPassword, navigate, form, handleApiError],
  );

  const handleRequestNewLink = useCallback(() => {
    navigate(appPaths.forgotPassword);
  }, [navigate]);

  const sectionError = useMemo(() => tokenError, [tokenError]);

  return {
    state: {
      form,
      sectionError,
    },
    actions: {
      handleSubmit,
      handleRequestNewLink,
    },
    flags: {
      isLoading,
      tokenMissing,
      submitSucceeded,
      submitDisabled: submitSucceeded || tokenMissing,
    },
  };
}

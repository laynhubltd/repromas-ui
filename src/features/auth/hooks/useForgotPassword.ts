import { useForgotPasswordMutation } from "@/features/auth/api/auth-api";
import {
  ForgotPasswordActionType,
  forgotPasswordReducer,
  initialForgotPasswordState,
} from "@/features/auth/state/forgotPasswordState";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { Form } from "antd";
import { useCallback, useEffect, useReducer, useRef } from "react";

const SUBMIT_COOLDOWN_MS = 3000;

export function useForgotPassword() {
  const [form] = Form.useForm<{ email: string }>();
  const [state, dispatch] = useReducer(
    forgotPasswordReducer,
    initialForgotPasswordState,
  );
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const handleApiError = useApiError();
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimer.current) {
        clearTimeout(cooldownTimer.current);
      }
    };
  }, []);

  const handleSubmit = useCallback(
    async (values: { email: string }) => {
      try {
        await forgotPassword({ email: values.email.trim() }).unwrap();
        dispatch({
          type: ForgotPasswordActionType.SetSuccess,
          email: values.email.trim(),
        });

        if (cooldownTimer.current) {
          clearTimeout(cooldownTimer.current);
        }
        cooldownTimer.current = setTimeout(() => {
          dispatch({
            type: ForgotPasswordActionType.SetSubmitCooldown,
            value: false,
          });
        }, SUBMIT_COOLDOWN_MS);
      } catch (err: unknown) {
        handleApiError(err, {
          context: { screen: RequestScreen.Form, method: "POST" },
          form,
        });
      }
    },
    [forgotPassword, form, handleApiError],
  );

  const handleTryAgain = useCallback(() => {
    dispatch({ type: ForgotPasswordActionType.Reset });
    form.resetFields();
  }, [form]);

  return {
    state: {
      form,
      submittedEmail: state.submittedEmail,
    },
    actions: {
      handleSubmit,
      handleTryAgain,
    },
    flags: {
      isLoading,
      isSuccess: state.phase === "success",
      submitCooldown: state.submitCooldown,
    },
  };
}

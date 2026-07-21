import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { useCallback, useMemo } from "react";
import { useGetUserByIdQuery, useResendPasswordResetMutation } from "../api/userManagementApi";

// ─── User Detail Drawer ───────────────────────────────────────────────────────

export function useUserDrawer(userId: number | null, open: boolean) {
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUserByIdQuery(userId ?? 0, {
    skip: !open || userId === null,
  });

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isError, error, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isError, error],
  );

  return {
    state: { user: user ?? null, isLoading, sectionError },
    actions: { refetch },
  };
}

// ─── Resend Password Reset Modal ──────────────────────────────────────────────

export function useResendPasswordModal(
  email: string | null,
  open: boolean,
  onClose: () => void,
) {
  const handleApiError = useApiError();
  const [resendPasswordReset, { isLoading: isSending }] =
    useResendPasswordResetMutation();

  void open; // open is consumed by the view — not needed in hook logic

  const handleConfirm = useCallback(async () => {
    if (!email) return;

    try {
      await resendPasswordReset({ email }).unwrap();
      notifyMutationSuccess("Password reset email sent successfully.");
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
    }
  }, [email, resendPasswordReset, onClose, handleApiError]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return {
    state: { isSending },
    actions: { handleConfirm, handleCancel },
  };
}

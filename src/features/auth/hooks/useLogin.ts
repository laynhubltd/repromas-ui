import { appPaths } from "@/app/routing/app-path";
import { useLoginMutation } from "@/features/auth/api/auth-api";
import { useGetAdmissionSignupConfigQuery } from "@/features/auth/candidate-signup/api/candidateSignupApi";
import { useAdmissionLoginTour } from "@/features/auth/candidate-signup/hooks/useAdmissionLoginTour";
import { buildAdmissionEditorialModel } from "@/features/auth/candidate-signup/utils/buildAdmissionEditorialModel";
import { consumeIdleLogoutReason } from "@/features/auth/idle-session/idle-session";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useLogin() {
  const navigate = useNavigate();
  const [login, loginState] = useLoginMutation();
  const [wasIdleLogout] = useState(() => consumeIdleLogoutReason());
  const signupConfigQuery = useGetAdmissionSignupConfigQuery();
  const signupConfig = signupConfigQuery.data;

  const isSignupConfigLoading =
    signupConfigQuery.isLoading || signupConfigQuery.isFetching;

  const isCandidateSignupAvailable =
    !isSignupConfigLoading &&
    signupConfig?.status === "APPLICATION_OPEN" &&
    (signupConfig.entryModes?.length ?? 0) > 0;

  const admissionEditorial = useMemo(() => {
    if (!isCandidateSignupAvailable || !signupConfig) return null;
    return buildAdmissionEditorialModel(signupConfig);
  }, [isCandidateSignupAvailable, signupConfig]);

  const tour = useAdmissionLoginTour(
    isCandidateSignupAvailable,
    signupConfig?.cycleId,
  );
  const { dismissTour } = tour;

  const errorMessage = useMemo(() => {
    if (!loginState.isError) return null;
    if (loginState.error && "data" in loginState.error) {
      return (
        (loginState.error.data as { message?: string })?.message ??
        "Login failed"
      );
    }
    return "Login failed";
  }, [loginState.isError, loginState.error]);

  const handleFinish = useCallback(
    async (values: { email: string; password: string }) => {
      await login({ email: values.email, password: values.password }).unwrap();
    },
    [login],
  );

  const handleStartRegistration = useCallback(() => {
    dismissTour();
    navigate(appPaths.candidateSignUp);
  }, [dismissTour, navigate]);

  return {
    state: {
      isLoading: loginState.isLoading,
      isError: loginState.isError,
      errorMessage,
      wasIdleLogout,
      isSignupConfigLoading,
      admissionEditorial,
      tourCtaElement: tour.ctaElement,
    },
    actions: {
      login,
      handleFinish,
      setTourCtaRef: tour.setCtaElement,
      handleDismissTour: dismissTour,
      handleFormFocus: tour.handleFormFocus,
      handleOpenGuide: tour.handleOpenGuide,
      handleStartRegistration,
    },
    flags: {
      isCandidateSignupAvailable,
      isTourOpen: tour.isTourOpen,
    },
  };
}

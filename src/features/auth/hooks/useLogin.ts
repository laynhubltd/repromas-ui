import { useLoginMutation } from "@/features/auth/api/auth-api";
import { useGetAdmissionSignupConfigQuery } from "@/features/auth/candidate-signup/api/candidateSignupApi";
export function useLogin() {
  const [login, loginState] = useLoginMutation();
  const signupConfigQuery = useGetAdmissionSignupConfigQuery();
  const signupConfig = signupConfigQuery.data;

  const isCandidateSignupAvailable =
    !signupConfigQuery.isLoading &&
    !signupConfigQuery.isFetching &&
    signupConfig?.status === "APPLICATION_OPEN";

  return {
    state: {
      isLoading: loginState.isLoading,
      isError: loginState.isError,
      error: loginState.error,
      isSignupConfigLoading:
        signupConfigQuery.isLoading || signupConfigQuery.isFetching,
      admissionCycleName: signupConfig?.name,
    },
    actions: {
      login: login,
    },
    flags: {
      isCandidateSignupAvailable,
    },
  };
}

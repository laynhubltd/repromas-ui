import { useGetAdmissionSignupConfigQuery } from "@/features/auth/candidate-signup/api/candidateSignupApi";
import { useLoginMutation } from "@/features/auth/api/auth-api";

export function useLogin() {
  const [login, loginState] = useLoginMutation();
  const signupConfigQuery = useGetAdmissionSignupConfigQuery();

  const isCandidateSignupAvailable =
    !signupConfigQuery.isLoading &&
    !signupConfigQuery.isFetching &&
    signupConfigQuery.data?.status === "APPLICATION_OPEN";

  return {
    state: {
      isLoading: loginState.isLoading,
      isError: loginState.isError,
      error: loginState.error,
      isSignupConfigLoading:
        signupConfigQuery.isLoading || signupConfigQuery.isFetching,
    },
    actions: {
      login: login,
    },
    flags: {
      isCandidateSignupAvailable,
    },
  };
}

import { baseApi } from "@/app/api/baseApi";
import { userLoggedIn } from "@/features/auth/events";
import type {
  AdmissionSignupConfig,
  AdmissionSignupConfigParams,
  CandidateLookupRequest,
  CandidateLookupResponse,
  CandidateSignupRequest,
  CandidateSignupResponse,
} from "../types/candidate-signup";
import { mapAdmissionSignupConfig } from "../utils/mapAdmissionSignupConfig";
import { mapCandidateLookupResponse } from "../utils/mapCandidateLookupResponse";
import { mapCandidateSignupResponse } from "../utils/mapCandidateSignupResponse";
import { mapCandidateSignupToLoginResponse } from "../utils/mapCandidateSignupToLoginResponse";

const candidateSignupApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionSignupConfig: builder.query<
      AdmissionSignupConfig,
      AdmissionSignupConfigParams | void
    >({
      query: (params) => ({
        url: "/admission/signup-config",
        method: "GET",
        params: params
          ? {
              ...(params.entryMode ? { entryMode: params.entryMode } : {}),
              ...(params.sessionId !== undefined
                ? { sessionId: params.sessionId }
                : {}),
            }
          : undefined,
      }),
      transformResponse: (raw) => mapAdmissionSignupConfig(raw),
    }),

    candidateLookup: builder.mutation<
      CandidateLookupResponse,
      CandidateLookupRequest
    >({
      query: (body) => ({
        url: "/admission/candidate-lookup",
        method: "POST",
        data: body,
      }),
      transformResponse: (raw) => mapCandidateLookupResponse(raw),
    }),

    candidateSignup: builder.mutation<
      CandidateSignupResponse,
      CandidateSignupRequest
    >({
      query: (body) => ({
        url: "/admission/candidate-signup",
        method: "POST",
        data: body,
      }),
      transformResponse: (raw) => mapCandidateSignupResponse(raw),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userLoggedIn(mapCandidateSignupToLoginResponse(data)));
        } catch {
          // handled by component/hook
        }
      },
    }),
  }),
});

export const {
  useGetAdmissionSignupConfigQuery,
  useCandidateLookupMutation,
  useCandidateSignupMutation,
} = candidateSignupApi;

export default candidateSignupApi;

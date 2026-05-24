import { baseApi } from "@/app/api/baseApi";
import { userLoggedIn } from "@/features/auth/events";
import type {
  AdmissionSignupConfig,
  CandidateLookupRequest,
  CandidateLookupResponse,
  CandidateSignupRequest,
  CandidateSignupResponse,
  LgaListParams,
  NigerianLga,
  PaginatedMember,
} from "../types/candidate-signup";
import { mapAdmissionSignupConfig } from "../utils/mapAdmissionSignupConfig";
import { mapCandidateLookupResponse } from "../utils/mapCandidateLookupResponse";
import { mapCandidateSignupResponse } from "../utils/mapCandidateSignupResponse";
import { mapCandidateSignupToLoginResponse } from "../utils/mapCandidateSignupToLoginResponse";

const candidateSignupApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionSignupConfig: builder.query<AdmissionSignupConfig, void>({
      query: () => ({
        url: "/admission/signup-config",
        method: "GET",
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

    getLgasByState: builder.query<PaginatedMember<NigerianLga>, LgaListParams>({
      query: ({ stateId, itemsPerPage = 200 }) => ({
        url: "/lgas",
        method: "GET",
        params: {
          "exact[state.id]": stateId,
          itemsPerPage,
        },
      }),
      transformResponse: (raw: unknown) => {
        const data = raw as Record<string, unknown>;
        const member = Array.isArray(data.member) ? data.member : [];
        return {
          member: member.map((item) => {
            const lga = item as Record<string, unknown>;
            return {
              id: typeof lga.id === "number" ? lga.id : 0,
              name: typeof lga.name === "string" ? lga.name : "",
              code: typeof lga.code === "string" ? lga.code : undefined,
              stateId:
                typeof lga.stateId === "number"
                  ? lga.stateId
                  : typeof lga.state_id === "number"
                    ? lga.state_id
                    : undefined,
            };
          }),
          totalItems:
            typeof data.totalItems === "number"
              ? data.totalItems
              : typeof data.total_items === "number"
                ? data.total_items
                : member.length,
        };
      },
    }),
  }),
});

export const {
  useGetAdmissionSignupConfigQuery,
  useCandidateLookupMutation,
  useCandidateSignupMutation,
  useGetLgasByStateQuery,
} = candidateSignupApi;

export default candidateSignupApi;

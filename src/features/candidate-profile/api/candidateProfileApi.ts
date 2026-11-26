import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  MeAdmissionCandidate,
  PatchMeAdmissionCandidateRequest,
  PatchMeProfileRequest,
} from "../types/me-admission-candidate";
import { mapMeAdmissionCandidate } from "../utils/mapMeAdmissionCandidate";

const DEFAULT_ME_CANDIDATE_INCLUDE =
  "cycle,state,lga,application.appliedProgram";

const candidateProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMeAdmissionCandidate: builder.query<
      MeAdmissionCandidate,
      { include?: string } | void
    >({
      query: (arg) => ({
        url: "/me/admission-candidate",
        method: "GET",
        params: {
          include: arg?.include ?? DEFAULT_ME_CANDIDATE_INCLUDE,
        },
      }),
      transformResponse: (raw) => mapMeAdmissionCandidate(raw),
      providesTags: [ApiTagTypes.MeAdmissionCandidate],
    }),

    patchMeAdmissionCandidate: builder.mutation<
      MeAdmissionCandidate,
      PatchMeAdmissionCandidateRequest
    >({
      query: (body) => ({
        url: "/me/admission-candidate",
        method: "PATCH",
        data: body,
        headers: { "Content-Type": "application/merge-patch+json" },
      }),
      transformResponse: (raw) => mapMeAdmissionCandidate(raw),
      invalidatesTags: [ApiTagTypes.MeAdmissionCandidate],
    }),

    patchMeProfile: builder.mutation<void, PatchMeProfileRequest>({
      query: (body) => ({
        url: "/me/profile",
        method: "PATCH",
        data: body,
        headers: { "Content-Type": "application/merge-patch+json" },
      }),
      invalidatesTags: [ApiTagTypes.MeAdmissionCandidate, ApiTagTypes.User],
    }),
  }),
});

export const {
  useGetMeAdmissionCandidateQuery,
  usePatchMeAdmissionCandidateMutation,
  usePatchMeProfileMutation,
} = candidateProfileApi;

export default candidateProfileApi;

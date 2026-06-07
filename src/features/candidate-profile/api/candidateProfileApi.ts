import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  MeAdmissionCandidate,
  PatchMeAdmissionCandidateRequest,
  PatchMeProfileRequest,
} from "../types/me-admission-candidate";
import { mapMeAdmissionCandidate } from "../utils/mapMeAdmissionCandidate";

const candidateProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMeAdmissionCandidate: builder.query<MeAdmissionCandidate, void>({
      query: () => ({
        url: "/me/admission-candidate",
        method: "GET",
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

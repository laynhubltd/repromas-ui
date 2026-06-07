import { baseApi } from "@/app/api/baseApi";
import type { AppStore } from "@/app/store";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import { CAPS_TEMPLATE_FILENAME } from "@/shared/constants/admissionCandidateOptions";
import { downloadFileFromUrl } from "@/shared/utils/download/downloadFile";
import type {
  AdmissionApplication,
  AdmissionCandidate,
  AdmissionCandidateListParams,
  CapsBulkUploadSummary,
  CreateAdmissionCandidateRequest,
  CreateAdmissionCandidateResponse,
  MatriculateResponse,
  PaginatedResponse,
  PatchAdmissionCandidateMetadataRequest,
} from "../types/admission-candidate";

const admissionCandidateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionCandidates: builder.query<
      PaginatedResponse<AdmissionCandidate>,
      AdmissionCandidateListParams
    >({
      query: (params) => ({
        url: "/admission-candidates",
        method: "GET",
        params,
      }),
      providesTags: [{ type: ApiTagTypes.AdmissionCandidate, id: "LIST" }],
    }),

    getAdmissionCandidate: builder.query<
      AdmissionCandidate,
      { id: number; include?: string }
    >({
      query: ({ id, include }) => ({
        url: `/admission-candidates/${id}`,
        method: "GET",
        params: include ? { include } : undefined,
      }),
      providesTags: (_result, _err, { id }) => [
        { type: ApiTagTypes.AdmissionCandidate, id },
      ],
    }),

    createAdmissionCandidate: builder.mutation<
      CreateAdmissionCandidateResponse,
      CreateAdmissionCandidateRequest
    >({
      query: (body) => ({
        url: "/admission-candidates",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [
        { type: ApiTagTypes.AdmissionCandidate, id: "LIST" },
        ApiTagTypes.AdmissionCycle,
        ApiTagTypes.SetupStatus,
      ],
    }),

    patchAdmissionCandidateMetadata: builder.mutation<
      AdmissionCandidate,
      { id: number } & PatchAdmissionCandidateMetadataRequest
    >({
      query: ({ id, metadata }) => ({
        url: `/admission-candidates/${id}/metadata`,
        method: "PATCH",
        data: { metadata },
        headers: { "Content-Type": "application/merge-patch+json" },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: ApiTagTypes.AdmissionCandidate, id: "LIST" },
        { type: ApiTagTypes.AdmissionCandidate, id },
      ],
    }),

    offerAdmissionCandidate: builder.mutation<
      AdmissionApplication,
      { id: number }
    >({
      query: ({ id }) => ({
        url: `/admission-candidates/${id}/offer`,
        method: "POST",
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: ApiTagTypes.AdmissionCandidate, id: "LIST" },
        { type: ApiTagTypes.AdmissionCandidate, id },
      ],
    }),

    matriculateAdmissionCandidate: builder.mutation<
      MatriculateResponse,
      { id: number }
    >({
      query: ({ id }) => ({
        url: `/admission-candidates/${id}/matriculate`,
        method: "POST",
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: ApiTagTypes.AdmissionCandidate, id: "LIST" },
        { type: ApiTagTypes.AdmissionCandidate, id },
      ],
    }),

    capsBulkUpload: builder.mutation<
      CapsBulkUploadSummary,
      { cycleId: number; formData: FormData }
    >({
      query: ({ cycleId, formData }) => ({
        url: `/admission-cycles/${cycleId}/caps/bulk-upload`,
        method: "POST",
        data: formData,
      }),
      invalidatesTags: [
        { type: ApiTagTypes.AdmissionCandidate, id: "LIST" },
        ApiTagTypes.AdmissionCycle,
      ],
    }),
  }),
});

export const {
  useGetAdmissionCandidatesQuery,
  useGetAdmissionCandidateQuery,
  useCreateAdmissionCandidateMutation,
  usePatchAdmissionCandidateMetadataMutation,
  useOfferAdmissionCandidateMutation,
  useMatriculateAdmissionCandidateMutation,
  useCapsBulkUploadMutation,
} = admissionCandidateApi;

export async function downloadCapsTemplate(
  store: AppStore,
  cycleId: number,
): Promise<void> {
  await downloadFileFromUrl(
    {
      url: `admission-cycles/${cycleId}/caps/bulk-upload/template`,
      filename: CAPS_TEMPLATE_FILENAME,
      accept: "application/ld+json",
    },
    store,
  );
}

export default admissionCandidateApi;

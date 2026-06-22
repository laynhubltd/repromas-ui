import { baseApi } from "@/app/api/baseApi";
import type { AppStore } from "@/app/store";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import { downloadFileFromUrl } from "@/shared/utils/download/downloadFile";
import type {
  AdmissionRecommendedCandidate,
  PaginatedResponse,
  RecommendedCandidateListParams,
} from "../types/admission-recommended-candidate";

const admissionRecommendedCandidateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRecommendedCandidates: builder.query<
      PaginatedResponse<AdmissionRecommendedCandidate>,
      RecommendedCandidateListParams
    >({
      query: (params) => ({
        url: "/admission-recommended-candidates",
        method: "GET",
        params,
      }),
      providesTags: [
        { type: ApiTagTypes.AdmissionRecommendedCandidate, id: "LIST" },
      ],
    }),
  }),
});

export const { useGetRecommendedCandidatesQuery } =
  admissionRecommendedCandidateApi;

/**
 * Downloads the recommended candidates report for a cycle as an Excel file.
 * Follows the same pattern as downloadCapsTemplate in admissionCandidateApi.
 */
export async function downloadRecommendedCandidates(
  store: AppStore,
  cycleId: number,
  sort = "aggregateScore:desc",
): Promise<void> {
  await downloadFileFromUrl(
    {
      url: `admission-cycles/${cycleId}/recommended-candidates/download?sort=${encodeURIComponent(sort)}`,
      filename: `recommended-candidates-cycle-${cycleId}.xlsx`,
      accept: "application/ld+json",
    },
    store,
  );
}

export default admissionRecommendedCandidateApi;

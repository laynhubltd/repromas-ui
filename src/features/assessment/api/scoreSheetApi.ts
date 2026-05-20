import { baseApi } from "@/app/api/baseApi";
import type { AppStore } from "@/app/store";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import { downloadFileFromUrl } from "@/shared/utils/download/downloadFile";
import type {
    ScoreSheetApiResponse,
    ScoreSheetUploadSummary,
    UpdateEvaluationStatusRequest,
    UpdateScoresRequest,
} from "../types/score-sheet";

const scoreSheetApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getScoreSheetData: builder.query<
      ScoreSheetApiResponse,
      { courseConfigId: number }
    >({
      query: ({ courseConfigId }) => ({
        url: `student-score-sheets/data/by-config/${courseConfigId}`,
        method: "GET",
      }),
      providesTags: [{ type: ApiTagTypes.StudentScoreSheetData, id: "LIST" }],
    }),

    upsertStudentScoreSheet: builder.mutation<void, UpdateScoresRequest>({
      query: ({ registrationId, componentScores }) => ({
        url: `student-score-sheets`,
        method: "POST",
        data: { registrationId, componentScores },
      }),
      invalidatesTags: [
        { type: ApiTagTypes.StudentScoreSheetData, id: "LIST" },
      ],
    }),

    updateEvaluationStatus: builder.mutation<
      void,
      UpdateEvaluationStatusRequest
    >({
      query: ({ scoreSheetId, evaluationStatusId }) => ({
        url: `student-score-sheets/${scoreSheetId}/evaluation-status`,
        method: "PATCH",
        headers: { "Content-Type": "application/merge-patch+json" },
        data: { evaluationStatusId },
      }),
      invalidatesTags: [
        { type: ApiTagTypes.StudentScoreSheetData, id: "LIST" },
      ],
    }),

    uploadScoreSheet: builder.mutation<
      ScoreSheetUploadSummary,
      { courseConfigId: number; file: File }
    >({
      query: ({ courseConfigId, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `student-score-sheets/upload/by-config/${courseConfigId}`,
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [
        { type: ApiTagTypes.StudentScoreSheetData, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetScoreSheetDataQuery,
  useUpsertStudentScoreSheetMutation,
  useUpdateEvaluationStatusMutation,
  useUploadScoreSheetMutation,
} = scoreSheetApi;

export async function downloadScoreSheet({
  courseConfigId,
  courseCode,
  courseTitle,
  store,
}: {
  courseConfigId: number;
  courseCode: string;
  courseTitle: string;
  store: AppStore;
}): Promise<void> {
  const safeName = `${courseCode}-${courseTitle}`
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  await downloadFileFromUrl(
    {
      url: `student-score-sheets/download/by-config/${courseConfigId}`,
      filename: `score-sheet-${safeName}.xlsx`,
    },
    store,
  );
}

export default scoreSheetApi;

import { baseApi } from "@/app/api/baseApi";
import type { AppStore } from "@/app/store";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import { downloadFileFromUrl } from "@/shared/utils/download/downloadFile";
import type {
  AssignEvaluationStatusRequest,
  ClearEvaluationStatusRequest,
  ScoreSheetApiResponse,
  ScoreSheetUploadSummary,
  StudentScoreSheetResponse,
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

    upsertStudentScoreSheet: builder.mutation<
      StudentScoreSheetResponse,
      UpdateScoresRequest
    >({
      query: ({ registrationId, componentScores, evaluationStatusId }) => ({
        url: `student-score-sheets`,
        method: "POST",
        data: {
          registrationId,
          componentScores,
          ...(evaluationStatusId !== undefined ? { evaluationStatusId } : {}),
        },
      }),
      async onQueryStarted(
        { courseConfigId, registrationId, componentScores },
        { dispatch, queryFulfilled },
      ) {
        if (!courseConfigId) return;
        try {
          const { data: updated } = await queryFulfilled;
          dispatch(
            scoreSheetApi.util.updateQueryData(
              "getScoreSheetData",
              { courseConfigId },
              (draft) => {
                const targetRow = draft.member?.[0]?.rows?.find(
                  (r) => r.registrationId === registrationId,
                );
                if (targetRow) {
                  targetRow.id = updated.id;
                  targetRow.scores = updated.componentScores ?? componentScores;
                  targetRow.totalScore = updated.totalScore;
                  targetRow.grade = updated.grade;
                  targetRow.displayGrade =
                    updated.displayGrade ?? updated.grade ?? "NR";
                  targetRow.gradePoint = updated.gradePoint ?? 0;
                  targetRow.isPass = updated.isPass;
                  targetRow.wasVetoed = updated.wasVetoed;
                  targetRow.vetoReason = updated.vetoReason;
                  targetRow.evaluationStatusId = updated.evaluationStatusId;
                  targetRow.evaluationStatusSource =
                    updated.evaluationStatusSource;
                }
              },
            ),
          );
        } catch {
          // Cache update skipped on error
        }
      },
      invalidatesTags: (_result, error, { componentScores }) =>
        (componentScores && Object.keys(componentScores).length === 0) || error
          ? [{ type: ApiTagTypes.StudentScoreSheetData, id: "LIST" }]
          : [],
    }),

    assignEvaluationStatus: builder.mutation<
      StudentScoreSheetResponse,
      AssignEvaluationStatusRequest
    >({
      query: ({ scoreSheetId, evaluationStatusId }) => ({
        url: `student-score-sheets/${scoreSheetId}/evaluation-status`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/merge-patch+json",
        },
        data: { evaluationStatusId },
      }),
      async onQueryStarted(
        { courseConfigId, scoreSheetId },
        { dispatch, queryFulfilled },
      ) {
        if (!courseConfigId) return;
        try {
          const { data: updated } = await queryFulfilled;
          dispatch(
            scoreSheetApi.util.updateQueryData(
              "getScoreSheetData",
              { courseConfigId },
              (draft) => {
                const targetRow = draft.member?.[0]?.rows?.find(
                  (r) => r.id === scoreSheetId,
                );
                if (targetRow) {
                  targetRow.evaluationStatusId = updated.evaluationStatusId;
                  targetRow.evaluationStatusSource =
                    updated.evaluationStatusSource;
                  targetRow.displayGrade =
                    updated.displayGrade ?? updated.grade ?? "NR";
                  targetRow.totalScore = updated.totalScore;
                  targetRow.grade = updated.grade;
                  targetRow.gradePoint = updated.gradePoint ?? 0;
                }
              },
            ),
          );
        } catch {
          // Cache update skipped on error
        }
      },
      invalidatesTags: (_result, error) =>
        error ? [{ type: ApiTagTypes.StudentScoreSheetData, id: "LIST" }] : [],
    }),

    clearEvaluationStatus: builder.mutation<
      StudentScoreSheetResponse,
      ClearEvaluationStatusRequest
    >({
      query: ({ scoreSheetId }) => ({
        url: `student-score-sheets/${scoreSheetId}/evaluation-status`,
        method: "DELETE",
      }),
      async onQueryStarted(
        { courseConfigId, scoreSheetId },
        { dispatch, queryFulfilled },
      ) {
        if (!courseConfigId) return;
        try {
          const { data: updated } = await queryFulfilled;
          dispatch(
            scoreSheetApi.util.updateQueryData(
              "getScoreSheetData",
              { courseConfigId },
              (draft) => {
                const targetRow = draft.member?.[0]?.rows?.find(
                  (r) => r.id === scoreSheetId,
                );
                if (targetRow) {
                  targetRow.evaluationStatusId = updated.evaluationStatusId;
                  targetRow.evaluationStatusSource =
                    updated.evaluationStatusSource;
                  targetRow.displayGrade =
                    updated.displayGrade ?? updated.grade ?? "NR";
                  targetRow.totalScore = updated.totalScore;
                  targetRow.grade = updated.grade;
                  targetRow.gradePoint = updated.gradePoint ?? 0;
                }
              },
            ),
          );
        } catch {
          // Cache update skipped on error
        }
      },
      invalidatesTags: (_result, error) =>
        error ? [{ type: ApiTagTypes.StudentScoreSheetData, id: "LIST" }] : [],
    }),

    updateEvaluationStatus: builder.mutation<
      StudentScoreSheetResponse,
      UpdateEvaluationStatusRequest
    >({
      query: ({ scoreSheetId, evaluationStatusId }) => ({
        url: `student-score-sheets/${scoreSheetId}/evaluation-status`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/merge-patch+json",
        },
        data: { evaluationStatusId },
      }),
      invalidatesTags: (_result, error) =>
        error ? [{ type: ApiTagTypes.StudentScoreSheetData, id: "LIST" }] : [],
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
  useAssignEvaluationStatusMutation,
  useClearEvaluationStatusMutation,
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
  courseCode?: string | null;
  courseTitle?: string | null;
  store: AppStore;
}): Promise<void> {
  const code = courseCode?.trim() || "course";
  const title = courseTitle?.trim() || String(courseConfigId);
  const safeName = `${code}-${title}`
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  await downloadFileFromUrl(
    {
      url: `student-score-sheets/download/by-config/${courseConfigId}`,
      filename: `score-sheet-${safeName || `config-${courseConfigId}`}.xlsx`,
    },
    store,
  );
}

export default scoreSheetApi;

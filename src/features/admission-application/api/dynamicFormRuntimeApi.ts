import { baseApi } from "@/app/api/baseApi";
import type {
  CreateSubmissionRequest,
  PatchSubmissionRequest,
  RenderPackage,
  RenderPackageParams,
  Submission,
} from "@/features/dynamic-form/types";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";

const dynamicFormRuntimeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRenderPackage: builder.query<RenderPackage, RenderPackageParams>({
      query: (params) => ({
        url: "/dynamic-forms/render-package",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.DynamicFormSubmission],
    }),

    createSubmission: builder.mutation<Submission, CreateSubmissionRequest>({
      query: (body) => ({
        url: "/dynamic-forms/submissions",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.DynamicFormSubmission],
    }),

    getSubmission: builder.query<Submission, number>({
      query: (id) => ({
        url: `/dynamic-form-submissions/${id}`,
        method: "GET",
      }),
      providesTags: (_r, _e, id) => [
        { type: ApiTagTypes.DynamicFormSubmission, id },
      ],
    }),

    patchSubmission: builder.mutation<
      Submission,
      { id: number; body: PatchSubmissionRequest }
    >({
      query: ({ id, body }) => ({
        url: `/dynamic-form-submissions/${id}`,
        method: "PATCH",
        data: body,
        headers: { "Content-Type": "application/merge-patch+json" },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: ApiTagTypes.DynamicFormSubmission, id },
        ApiTagTypes.MeAdmissionProgress,
      ],
    }),

    submitSubmission: builder.mutation<
      Submission,
      { id: number; idempotencyKey: string; payload?: PatchSubmissionRequest }
    >({
      query: ({ id, idempotencyKey, payload }) => ({
        url: `/dynamic-form-submissions/${id}/submit`,
        method: "POST",
        data: payload ?? {},
        headers: { "Idempotency-Key": idempotencyKey },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: ApiTagTypes.DynamicFormSubmission, id },
        ApiTagTypes.MeAdmissionApplication,
        ApiTagTypes.MeAdmissionProgress,
      ],
    }),
  }),
});

export const {
  useGetRenderPackageQuery,
  useLazyGetRenderPackageQuery,
  useCreateSubmissionMutation,
  useGetSubmissionQuery,
  usePatchSubmissionMutation,
  useSubmitSubmissionMutation,
} = dynamicFormRuntimeApi;

export default dynamicFormRuntimeApi;

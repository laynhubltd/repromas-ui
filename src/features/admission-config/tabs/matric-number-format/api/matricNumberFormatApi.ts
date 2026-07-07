import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import { apiPlatformActionPost } from "@/shared/utils/api/apiPlatformActionPost";
import type {
  CreateMatricNumberFormatRequest,
  MatricFormatsActiveResponse,
  MatricNumberFormat,
  MatricNumberFormatDuplicateRequest,
  MatricNumberFormatListParams,
  MatricNumberFormatPreviewRequest,
  MatricNumberFormatPreviewResponse,
  MatricNumberFormatPrerequisites,
  PaginatedResponse,
  UpdateMatricNumberFormatRequest,
} from "../types/matric-number-format";

const matricFormatMutationInvalidation = (id?: number) => [
  { type: ApiTagTypes.MatricNumberFormat, id: "LIST" as const },
  { type: ApiTagTypes.MatricNumberFormat, id: "ACTIVE_SLOTS" as const },
  ...(id !== undefined ? [{ type: ApiTagTypes.MatricNumberFormat, id }] : []),
];

const matricNumberFormatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMatricNumberFormats: builder.query<
      PaginatedResponse<MatricNumberFormat>,
      MatricNumberFormatListParams
    >({
      query: (params) => ({
        url: "/matric-number-formats",
        method: "GET",
        params,
      }),
      providesTags: [{ type: ApiTagTypes.MatricNumberFormat, id: "LIST" }],
    }),

    getMatricNumberFormat: builder.query<MatricNumberFormat, { id: number }>({
      query: ({ id }) => ({
        url: `/matric-number-formats/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, { id }) => [
        { type: ApiTagTypes.MatricNumberFormat, id },
      ],
    }),

    getMatricNumberFormatPrerequisites: builder.query<
      MatricNumberFormatPrerequisites,
      void
    >({
      query: () => ({
        url: "/matric-number-formats/prerequisites",
        method: "GET",
      }),
      providesTags: [{ type: ApiTagTypes.MatricNumberFormat, id: "PREREQUISITES" }],
    }),

    getMatricNumberFormatsActive: builder.query<MatricFormatsActiveResponse, void>({
      query: () => ({
        url: "/matric-number-formats/active",
        method: "GET",
      }),
      providesTags: [{ type: ApiTagTypes.MatricNumberFormat, id: "ACTIVE_SLOTS" }],
    }),

    createMatricNumberFormat: builder.mutation<
      MatricNumberFormat,
      CreateMatricNumberFormatRequest
    >({
      query: (body) => ({
        url: "/matric-number-formats",
        method: "POST",
        data: body,
      }),
      invalidatesTags: matricFormatMutationInvalidation(),
    }),

    updateMatricNumberFormat: builder.mutation<
      MatricNumberFormat,
      UpdateMatricNumberFormatRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/matric-number-formats/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: (_result, _error, { id }) => matricFormatMutationInvalidation(id),
    }),

    previewMatricNumberFormat: builder.mutation<
      MatricNumberFormatPreviewResponse,
      MatricNumberFormatPreviewRequest
    >({
      query: (body) => ({
        url: "/matric-number-formats/preview",
        method: "POST",
        data: body,
      }),
    }),

    activateMatricNumberFormat: builder.mutation<MatricNumberFormat, number>({
      query: (id) => ({
        url: `/matric-number-formats/${id}/activate`,
        method: "POST",
        ...apiPlatformActionPost,
      }),
      invalidatesTags: (_result, _error, id) => matricFormatMutationInvalidation(id),
    }),

    deactivateMatricNumberFormat: builder.mutation<MatricNumberFormat, number>({
      query: (id) => ({
        url: `/matric-number-formats/${id}/deactivate`,
        method: "POST",
        ...apiPlatformActionPost,
      }),
      invalidatesTags: (_result, _error, id) => matricFormatMutationInvalidation(id),
    }),

    reactivateMatricNumberFormat: builder.mutation<MatricNumberFormat, number>({
      query: (id) => ({
        url: `/matric-number-formats/${id}/reactivate`,
        method: "POST",
        ...apiPlatformActionPost,
      }),
      invalidatesTags: (_result, _error, id) => matricFormatMutationInvalidation(id),
    }),

    duplicateMatricNumberFormat: builder.mutation<
      MatricNumberFormat,
      MatricNumberFormatDuplicateRequest
    >({
      query: ({ id, code }) => ({
        url: `/matric-number-formats/${id}/duplicate`,
        method: "POST",
        data: { code },
      }),
      invalidatesTags: matricFormatMutationInvalidation(),
    }),
  }),
});

export const {
  useGetMatricNumberFormatsQuery,
  useGetMatricNumberFormatQuery,
  useGetMatricNumberFormatPrerequisitesQuery,
  useGetMatricNumberFormatsActiveQuery,
  useCreateMatricNumberFormatMutation,
  useUpdateMatricNumberFormatMutation,
  usePreviewMatricNumberFormatMutation,
  useActivateMatricNumberFormatMutation,
  useDeactivateMatricNumberFormatMutation,
  useReactivateMatricNumberFormatMutation,
  useDuplicateMatricNumberFormatMutation,
} = matricNumberFormatApi;

export default matricNumberFormatApi;

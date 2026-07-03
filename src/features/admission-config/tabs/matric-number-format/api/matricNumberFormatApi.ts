import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import { apiPlatformActionPost } from "@/shared/utils/api/apiPlatformActionPost";
import type {
  CreateMatricNumberFormatRequest,
  MatricNumberFormat,
  MatricNumberFormatDuplicateRequest,
  MatricNumberFormatListParams,
  MatricNumberFormatPreviewRequest,
  MatricNumberFormatPreviewResponse,
  MatricNumberFormatPrerequisites,
  PaginatedResponse,
  UpdateMatricNumberFormatRequest,
} from "../types/matric-number-format";

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

    createMatricNumberFormat: builder.mutation<
      MatricNumberFormat,
      CreateMatricNumberFormatRequest
    >({
      query: (body) => ({
        url: "/matric-number-formats",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: ApiTagTypes.MatricNumberFormat, id: "LIST" }],
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
      invalidatesTags: (_result, _error, { id }) => [
        { type: ApiTagTypes.MatricNumberFormat, id: "LIST" },
        { type: ApiTagTypes.MatricNumberFormat, id },
      ],
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
      invalidatesTags: [{ type: ApiTagTypes.MatricNumberFormat, id: "LIST" }],
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
      invalidatesTags: [{ type: ApiTagTypes.MatricNumberFormat, id: "LIST" }],
    }),
  }),
});

export const {
  useGetMatricNumberFormatsQuery,
  useGetMatricNumberFormatQuery,
  useGetMatricNumberFormatPrerequisitesQuery,
  useCreateMatricNumberFormatMutation,
  useUpdateMatricNumberFormatMutation,
  usePreviewMatricNumberFormatMutation,
  useActivateMatricNumberFormatMutation,
  useDuplicateMatricNumberFormatMutation,
} = matricNumberFormatApi;

export default matricNumberFormatApi;

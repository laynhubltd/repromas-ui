import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  CreateOlevelSubjectRequest,
  OlevelSubject,
  OlevelSubjectListParams,
  PaginatedResponse,
  PopulateOlevelSubjectsResponse,
  UpdateOlevelSubjectRequest,
} from "../types/olevel-subject";

const olevelSubjectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOlevelSubjects: builder.query<
      PaginatedResponse<OlevelSubject>,
      OlevelSubjectListParams
    >({
      query: (params) => ({
        url: "/olevel-subjects",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.OlevelSubject],
    }),

    getOlevelSubject: builder.query<OlevelSubject, number>({
      query: (id) => ({
        url: `/olevel-subjects/${id}`,
        method: "GET",
      }),
      providesTags: [ApiTagTypes.OlevelSubject],
    }),

    createOlevelSubject: builder.mutation<
      OlevelSubject,
      CreateOlevelSubjectRequest
    >({
      query: (body) => ({
        url: "/olevel-subjects",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.OlevelSubject],
    }),

    updateOlevelSubject: builder.mutation<
      OlevelSubject,
      UpdateOlevelSubjectRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/olevel-subjects/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.OlevelSubject],
    }),

    deleteOlevelSubject: builder.mutation<void, number>({
      query: (id) => ({
        url: `/olevel-subjects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTagTypes.OlevelSubject],
    }),

    populateOlevelSubjects: builder.mutation<
      PopulateOlevelSubjectsResponse,
      void
    >({
      query: () => ({
        url: "/olevel-subjects/populate",
        method: "POST",
      }),
      invalidatesTags: [ApiTagTypes.OlevelSubject],
    }),
  }),
});

export const {
  useGetOlevelSubjectsQuery,
  useGetOlevelSubjectQuery,
  useCreateOlevelSubjectMutation,
  useUpdateOlevelSubjectMutation,
  useDeleteOlevelSubjectMutation,
  usePopulateOlevelSubjectsMutation,
} = olevelSubjectApi;

export default olevelSubjectApi;

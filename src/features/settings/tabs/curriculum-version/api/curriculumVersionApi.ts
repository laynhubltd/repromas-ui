import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
    ActivateCurriculumVersionRequest,
    CreateCurriculumVersionRequest,
    CurriculumVersion,
    CurriculumVersionListParams,
    HydraCollection,
    UpdateCurriculumVersionRequest,
} from "../types/curriculum-version";

const curriculumVersionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurriculumVersions: builder.query<
      HydraCollection<CurriculumVersion>,
      CurriculumVersionListParams
    >({
      query: (params) => ({ url: "/curriculum-versions", method: "GET", params }),
      providesTags: [ApiTagTypes.CurriculumVersion],
    }),
    getCurriculumVersion: builder.query<CurriculumVersion, number>({
      query: (id) => ({ url: `/curriculum-versions/${id}`, method: "GET" }),
      providesTags: [ApiTagTypes.CurriculumVersion],
    }),
    createCurriculumVersion: builder.mutation<CurriculumVersion, CreateCurriculumVersionRequest>({
      query: (body) => ({ url: "/curriculum-versions", method: "POST", data: body }),
      invalidatesTags: [ApiTagTypes.CurriculumVersion],
    }),
    updateCurriculumVersion: builder.mutation<CurriculumVersion, UpdateCurriculumVersionRequest>({
      query: ({ id, ...body }) => ({ url: `/curriculum-versions/${id}`, method: "PUT", data: body }),
      invalidatesTags: [ApiTagTypes.CurriculumVersion],
    }),
    activateCurriculumVersion: builder.mutation<CurriculumVersion, ActivateCurriculumVersionRequest>({
      query: ({ id }) => ({
        url: `/curriculum-versions/${id}/activate`,
        method: "PATCH",
        data: {},
        headers: { "Content-Type": "application/merge-patch+json" },
      }),
      invalidatesTags: [ApiTagTypes.CurriculumVersion],
    }),
    deleteCurriculumVersion: builder.mutation<void, number>({
      query: (id) => ({ url: `/curriculum-versions/${id}`, method: "DELETE" }),
      invalidatesTags: [ApiTagTypes.CurriculumVersion],
    }),
  }),
});

export const {
  useGetCurriculumVersionsQuery,
  useGetCurriculumVersionQuery,
  useCreateCurriculumVersionMutation,
  useUpdateCurriculumVersionMutation,
  useActivateCurriculumVersionMutation,
  useDeleteCurriculumVersionMutation,
} = curriculumVersionApi;

export default curriculumVersionApi;

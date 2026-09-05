import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  ActivateCurriculumVersionRequest,
  CloneCurriculumVersionRequest,
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
      CurriculumVersionListParams | void
    >({
      query: (params) => ({ url: "/curriculum-versions", method: "GET", params: params ?? undefined }),
      providesTags: [ApiTagTypes.CurriculumVersion],
    }),
    getProgramCurriculumVersions: builder.query<
      HydraCollection<CurriculumVersion>,
      { programId: number; include?: string }
    >({
      query: ({ programId, include }) => ({
        url: `/programs/${programId}/curriculum-versions`,
        method: "GET",
        params: include ? { include } : undefined,
      }),
      providesTags: [ApiTagTypes.CurriculumVersion],
    }),
    getCurriculumVersion: builder.query<CurriculumVersion, number>({
      query: (id) => ({ url: `/curriculum-versions/${id}`, method: "GET" }),
      providesTags: [ApiTagTypes.CurriculumVersion],
    }),
    createCurriculumVersion: builder.mutation<CurriculumVersion, CreateCurriculumVersionRequest>({
      query: (body) => ({ url: "/curriculum-versions", method: "POST", data: body }),
      invalidatesTags: [ApiTagTypes.CurriculumVersion, ApiTagTypes.SetupStatus],
    }),
    cloneCurriculumVersion: builder.mutation<CurriculumVersion, CloneCurriculumVersionRequest>({
      query: ({ id, ...body }) => ({
        url: `/curriculum-versions/${id}/clone`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: [
        ApiTagTypes.CurriculumVersion,
        ApiTagTypes.CourseConfiguration,
        ApiTagTypes.ProgramGraduationRequirement,
        ApiTagTypes.SetupStatus,
      ],
    }),
    updateCurriculumVersion: builder.mutation<CurriculumVersion, UpdateCurriculumVersionRequest>({
      query: ({ id, ...body }) => ({ url: `/curriculum-versions/${id}`, method: "PUT", data: body }),
      invalidatesTags: [ApiTagTypes.CurriculumVersion, ApiTagTypes.SetupStatus],
    }),
    activateCurriculumVersion: builder.mutation<CurriculumVersion, ActivateCurriculumVersionRequest>({
      query: ({ id }) => ({
        url: `/curriculum-versions/${id}/activate`,
        method: "PATCH",
        data: {},
        headers: { "Content-Type": "application/merge-patch+json" },
      }),
      invalidatesTags: [ApiTagTypes.CurriculumVersion, ApiTagTypes.SetupStatus],
    }),
    deleteCurriculumVersion: builder.mutation<void, number>({
      query: (id) => ({ url: `/curriculum-versions/${id}`, method: "DELETE" }),
      invalidatesTags: [ApiTagTypes.CurriculumVersion, ApiTagTypes.SetupStatus],
    }),
  }),
});

export const {
  useGetCurriculumVersionsQuery,
  useGetProgramCurriculumVersionsQuery,
  useGetCurriculumVersionQuery,
  useCreateCurriculumVersionMutation,
  useCloneCurriculumVersionMutation,
  useUpdateCurriculumVersionMutation,
  useActivateCurriculumVersionMutation,
  useDeleteCurriculumVersionMutation,
} = curriculumVersionApi;

export default curriculumVersionApi;


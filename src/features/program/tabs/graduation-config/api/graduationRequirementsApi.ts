import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
    CreateGraduationRequirementRequest,
    GraduationRequirementListParams,
    PaginatedResponse,
    ProgramGraduationRequirement,
    UpdateGraduationRequirementRequest,
} from "../types/graduation-requirement";

const graduationRequirementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGraduationRequirements: builder.query<
      PaginatedResponse<ProgramGraduationRequirement>,
      GraduationRequirementListParams
    >({
      query: (params) => ({
        url: "program-graduation-requirements",
        method: "GET",
        params,
      }),
      providesTags: [{ type: ApiTagTypes.ProgramGraduationRequirement, id: "LIST" }],
    }),

    createGraduationRequirement: builder.mutation<
      ProgramGraduationRequirement,
      CreateGraduationRequirementRequest
    >({
      query: (body) => ({
        url: "program-graduation-requirements",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: ApiTagTypes.ProgramGraduationRequirement, id: "LIST" }],
    }),

    updateGraduationRequirement: builder.mutation<
      ProgramGraduationRequirement,
      { id: number } & UpdateGraduationRequirementRequest
    >({
      query: ({ id, ...body }) => ({
        url: `program-graduation-requirements/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [{ type: ApiTagTypes.ProgramGraduationRequirement, id: "LIST" }],
    }),

    deleteGraduationRequirement: builder.mutation<void, number>({
      query: (id) => ({
        url: `program-graduation-requirements/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: ApiTagTypes.ProgramGraduationRequirement, id: "LIST" }],
    }),
  }),
});

export const {
  useGetGraduationRequirementsQuery,
  useCreateGraduationRequirementMutation,
  useUpdateGraduationRequirementMutation,
  useDeleteGraduationRequirementMutation,
} = graduationRequirementsApi;

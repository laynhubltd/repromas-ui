import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  CreateProgramOlevelRequirementRequest,
  PaginatedResponse,
  ProgramOlevelRequirement,
  ProgramOlevelRequirementListParams,
  UpdateProgramOlevelRequirementRequest,
} from "../types/program-olevel-rule";

const programOlevelRuleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProgramOlevelRequirements: builder.query<
      PaginatedResponse<ProgramOlevelRequirement>,
      ProgramOlevelRequirementListParams
    >({
      query: (params) => ({
        url: "/program-olevel-requirements",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.ProgramOlevelRequirement],
    }),

    getProgramOlevelRequirement: builder.query<ProgramOlevelRequirement, number>({
      query: (id) => ({
        url: `/program-olevel-requirements/${id}`,
        method: "GET",
      }),
      providesTags: [ApiTagTypes.ProgramOlevelRequirement],
    }),

    createProgramOlevelRequirement: builder.mutation<
      ProgramOlevelRequirement,
      CreateProgramOlevelRequirementRequest
    >({
      query: (body) => ({
        url: "/program-olevel-requirements",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.ProgramOlevelRequirement],
    }),

    updateProgramOlevelRequirement: builder.mutation<
      ProgramOlevelRequirement,
      UpdateProgramOlevelRequirementRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/program-olevel-requirements/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.ProgramOlevelRequirement],
    }),

    deleteProgramOlevelRequirement: builder.mutation<void, number>({
      query: (id) => ({
        url: `/program-olevel-requirements/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTagTypes.ProgramOlevelRequirement],
    }),
  }),
});

export const {
  useGetProgramOlevelRequirementsQuery,
  useGetProgramOlevelRequirementQuery,
  useCreateProgramOlevelRequirementMutation,
  useUpdateProgramOlevelRequirementMutation,
  useDeleteProgramOlevelRequirementMutation,
} = programOlevelRuleApi;

export default programOlevelRuleApi;

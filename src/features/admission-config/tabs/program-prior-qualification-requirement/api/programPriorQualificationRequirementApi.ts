import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  CreateProgramPriorQualificationRequirementRequest,
  PaginatedProgramPriorQualRequirementResponse,
  ProgramPriorQualificationRequirement,
  ProgramPriorQualRequirementListParams,
  UpdateProgramPriorQualificationRequirementRequest,
} from "../types/program-prior-qualification-requirement";

const programPriorQualificationRequirementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProgramPriorQualificationRequirements: builder.query<
      PaginatedProgramPriorQualRequirementResponse,
      ProgramPriorQualRequirementListParams
    >({
      query: (params) => ({
        url: "/program-prior-qualification-requirements",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.ProgramPriorQualificationRequirement],
    }),

    getProgramPriorQualificationRequirement: builder.query<
      ProgramPriorQualificationRequirement,
      number
    >({
      query: (id) => ({
        url: `/program-prior-qualification-requirements/${id}`,
        method: "GET",
      }),
      providesTags: [ApiTagTypes.ProgramPriorQualificationRequirement],
    }),

    createProgramPriorQualificationRequirement: builder.mutation<
      ProgramPriorQualificationRequirement,
      CreateProgramPriorQualificationRequirementRequest
    >({
      query: (body) => ({
        url: "/program-prior-qualification-requirements",
        method: "POST",
        data: body,
        headers: { "Content-Type": "application/ld+json" },
      }),
      invalidatesTags: [ApiTagTypes.ProgramPriorQualificationRequirement],
    }),

    updateProgramPriorQualificationRequirement: builder.mutation<
      ProgramPriorQualificationRequirement,
      UpdateProgramPriorQualificationRequirementRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/program-prior-qualification-requirements/${id}`,
        method: "PUT",
        data: body,
        headers: { "Content-Type": "application/ld+json" },
      }),
      invalidatesTags: [ApiTagTypes.ProgramPriorQualificationRequirement],
    }),

    deleteProgramPriorQualificationRequirement: builder.mutation<void, number>({
      query: (id) => ({
        url: `/program-prior-qualification-requirements/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTagTypes.ProgramPriorQualificationRequirement],
    }),
  }),
});

export const {
  useGetProgramPriorQualificationRequirementsQuery,
  useGetProgramPriorQualificationRequirementQuery,
  useCreateProgramPriorQualificationRequirementMutation,
  useUpdateProgramPriorQualificationRequirementMutation,
  useDeleteProgramPriorQualificationRequirementMutation,
} = programPriorQualificationRequirementApi;

export default programPriorQualificationRequirementApi;

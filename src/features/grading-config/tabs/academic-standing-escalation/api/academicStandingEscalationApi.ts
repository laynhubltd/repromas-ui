import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  AcademicStandingEscalationStep,
  CreateEscalationStepRequest,
  EscalationStepListParams,
  UpdateEscalationStepRequest,
} from "../types/academic-standing-escalation";

export interface EscalationStepListResponse {
  totalItems: number;
  member: AcademicStandingEscalationStep[];
}

const academicStandingEscalationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAcademicStandingEscalationSteps: builder.query<
      EscalationStepListResponse,
      EscalationStepListParams
    >({
      query: ({
        academicStandingBoundaryId,
        sort = "stepNumber:asc",
        include = "studentTransitionStatus",
      }) => ({
        url: "/academic-standing-escalation-steps",
        method: "GET",
        params: {
          "exact[academicStandingBoundaryId]": academicStandingBoundaryId,
          sort,
          include,
          itemsPerPage: 50,
        },
      }),
      providesTags: [ApiTagTypes.AcademicStandingEscalationStep],
    }),

    getAcademicStandingEscalationStepById: builder.query<
      AcademicStandingEscalationStep,
      number
    >({
      query: (id) => ({
        url: `/academic-standing-escalation-steps/${id}`,
        method: "GET",
        params: {
          include: "studentTransitionStatus",
        },
      }),
      providesTags: (_res, _err, id) => [
        { type: ApiTagTypes.AcademicStandingEscalationStep, id },
      ],
    }),

    createAcademicStandingEscalationStep: builder.mutation<
      AcademicStandingEscalationStep,
      CreateEscalationStepRequest
    >({
      query: (body) => ({
        url: "/academic-standing-escalation-steps",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [
        ApiTagTypes.AcademicStandingEscalationStep,
        ApiTagTypes.AcademicStandingBoundary,
        ApiTagTypes.AcademicStanding,
      ],
    }),

    updateAcademicStandingEscalationStep: builder.mutation<
      AcademicStandingEscalationStep,
      UpdateEscalationStepRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/academic-standing-escalation-steps/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [
        ApiTagTypes.AcademicStandingEscalationStep,
        ApiTagTypes.AcademicStandingBoundary,
        ApiTagTypes.AcademicStanding,
      ],
    }),

    deleteAcademicStandingEscalationStep: builder.mutation<void, number>({
      query: (id) => ({
        url: `/academic-standing-escalation-steps/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        ApiTagTypes.AcademicStandingEscalationStep,
        ApiTagTypes.AcademicStandingBoundary,
        ApiTagTypes.AcademicStanding,
      ],
    }),
  }),
});

export const {
  useGetAcademicStandingEscalationStepsQuery,
  useGetAcademicStandingEscalationStepByIdQuery,
  useCreateAcademicStandingEscalationStepMutation,
  useUpdateAcademicStandingEscalationStepMutation,
  useDeleteAcademicStandingEscalationStepMutation,
} = academicStandingEscalationApi;

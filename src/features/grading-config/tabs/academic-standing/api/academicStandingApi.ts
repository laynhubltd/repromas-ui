import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  AcademicStanding,
  AcademicStandingListParams,
  CreateAcademicStandingRequest,
  UpdateAcademicStandingRequest,
} from "../types/academic-standing";

export interface PaginatedAcademicStandingResponse {
  totalItems: number;
  member: AcademicStanding[];
}

const academicStandingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAcademicStandings: builder.query<
      PaginatedAcademicStandingResponse,
      AcademicStandingListParams | void
    >({
      query: (params) => ({
        url: "/academic-standings",
        method: "GET",
        params: {
          include: "boundaries,level,curriculumVersion",
          itemsPerPage: 50,
          ...params,
        },
      }),
      providesTags: [ApiTagTypes.AcademicStanding],
    }),

    getAcademicStandingById: builder.query<AcademicStanding, number>({
      query: (id) => ({
        url: `/academic-standings/${id}`,
        method: "GET",
        params: {
          include: "boundaries,level,curriculumVersion",
        },
      }),
      providesTags: (_res, _err, id) => [{ type: ApiTagTypes.AcademicStanding, id }],
    }),

    createAcademicStanding: builder.mutation<AcademicStanding, CreateAcademicStandingRequest>({
      query: (body) => ({
        url: "/academic-standings",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.AcademicStanding],
    }),

    updateAcademicStanding: builder.mutation<AcademicStanding, UpdateAcademicStandingRequest>({
      query: ({ id, ...body }) => ({
        url: `/academic-standings/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.AcademicStanding],
    }),

    deleteAcademicStanding: builder.mutation<void, number>({
      query: (id) => ({
        url: `/academic-standings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTagTypes.AcademicStanding],
    }),
  }),
});

export const {
  useGetAcademicStandingsQuery,
  useGetAcademicStandingByIdQuery,
  useCreateAcademicStandingMutation,
  useUpdateAcademicStandingMutation,
  useDeleteAcademicStandingMutation,
} = academicStandingApi;

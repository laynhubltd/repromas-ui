import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  AcademicStandingBoundary,
  BoundaryListParams,
  CreateBoundaryRequest,
  UpdateBoundaryRequest,
} from "../types/academic-standing-boundary";

export interface BoundaryListResponse {
  totalItems: number;
  member: AcademicStandingBoundary[];
}

const academicStandingBoundaryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAcademicStandingBoundaries: builder.query<
      BoundaryListResponse,
      BoundaryListParams
    >({
      query: ({ academicStandingId, sort = "minCgpa:desc", include = "escalationSteps,studentTransitionStatus" }) => ({
        url: "/academic-standing-boundaries",
        method: "GET",
        params: {
          "exact[academicStandingId]": academicStandingId,
          sort,
          include,
          itemsPerPage: 50,
        },
      }),
      providesTags: [ApiTagTypes.AcademicStandingBoundary],
    }),

    getAcademicStandingBoundaryById: builder.query<AcademicStandingBoundary, number>({
      query: (id) => ({
        url: `/academic-standing-boundaries/${id}`,
        method: "GET",
        params: {
          include: "escalationSteps,studentTransitionStatus",
        },
      }),
      providesTags: (_res, _err, id) => [{ type: ApiTagTypes.AcademicStandingBoundary, id }],
    }),

    createAcademicStandingBoundary: builder.mutation<
      AcademicStandingBoundary,
      CreateBoundaryRequest
    >({
      query: (body) => ({
        url: "/academic-standing-boundaries",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [
        ApiTagTypes.AcademicStandingBoundary,
        ApiTagTypes.AcademicStanding,
      ],
    }),

    updateAcademicStandingBoundary: builder.mutation<
      AcademicStandingBoundary,
      UpdateBoundaryRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/academic-standing-boundaries/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [
        ApiTagTypes.AcademicStandingBoundary,
        ApiTagTypes.AcademicStanding,
      ],
    }),

    deleteAcademicStandingBoundary: builder.mutation<void, number>({
      query: (id) => ({
        url: `/academic-standing-boundaries/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        ApiTagTypes.AcademicStandingBoundary,
        ApiTagTypes.AcademicStanding,
      ],
    }),
  }),
});

export const {
  useGetAcademicStandingBoundariesQuery,
  useGetAcademicStandingBoundaryByIdQuery,
  useCreateAcademicStandingBoundaryMutation,
  useUpdateAcademicStandingBoundaryMutation,
  useDeleteAcademicStandingBoundaryMutation,
} = academicStandingBoundaryApi;

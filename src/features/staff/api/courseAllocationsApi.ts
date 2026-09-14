import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  BatchAllocateCoursesPayload,
  CourseAllocation,
  CourseAllocationListParams,
  CourseAllocationListResponse,
  CreateCourseAllocationPayload,
} from "../types/courseAllocation";

const courseAllocationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCourseAllocations: builder.query<
      CourseAllocationListResponse,
      CourseAllocationListParams
    >({
      query: (params) => ({ url: "course-allocations", method: "GET", params }),
      providesTags: [{ type: ApiTagTypes.CourseAllocation, id: "LIST" }],
    }),

    getCourseAllocation: builder.query<
      CourseAllocation,
      { id: number; include?: string }
    >({
      query: ({ id, include }) => ({
        url: `course-allocations/${id}`,
        method: "GET",
        params: include ? { include } : undefined,
      }),
      providesTags: (_result, _err, { id }) => [
        { type: ApiTagTypes.CourseAllocation, id },
      ],
    }),

    createCourseAllocation: builder.mutation<
      CourseAllocation,
      CreateCourseAllocationPayload
    >({
      query: (body) => ({
        url: "course-allocations",
        method: "POST",
        data: body,
      }),
      invalidatesTags: (result) => [
        { type: ApiTagTypes.CourseAllocation, id: "LIST" },
        ...(result?.id ? [{ type: ApiTagTypes.CourseAllocation, id: result.id }] : []),
      ],
    }),

    batchAllocateCourses: builder.mutation<
      CourseAllocation[],
      BatchAllocateCoursesPayload
    >({
      query: (body) => ({
        url: "course-allocations/batch",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: ApiTagTypes.CourseAllocation, id: "LIST" }],
    }),

    deleteCourseAllocation: builder.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `course-allocations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: ApiTagTypes.CourseAllocation, id: "LIST" },
        { type: ApiTagTypes.CourseAllocation, id },
      ],
    }),
  }),
});

export const {
  useGetCourseAllocationsQuery,
  useGetCourseAllocationQuery,
  useCreateCourseAllocationMutation,
  useBatchAllocateCoursesMutation,
  useDeleteCourseAllocationMutation,
} = courseAllocationsApi;

export default courseAllocationsApi;

import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type { PaginatedResponse, Semester } from "../../academic-calendar/types/academic-calendar";
import type {
    CreateSystemTimeFrameRequest,
    SemesterListParams,
    SystemTimeFrame,
    SystemTimeFrameListParams,
    UpdateSystemTimeFrameRequest,
} from "../types/system-timeframe";

const systemTimeFramesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemTimeFrames: builder.query<PaginatedResponse<SystemTimeFrame>, SystemTimeFrameListParams>({
      query: (params) => ({ url: "/system-time-frames", method: "GET", params }),
      providesTags: [ApiTagTypes.SystemTimeFrame],
    }),
    getSystemTimeFrame: builder.query<SystemTimeFrame, number>({
      query: (id) => ({ url: `/system-time-frames/${id}`, method: "GET" }),
      providesTags: [ApiTagTypes.SystemTimeFrame],
    }),
    createSystemTimeFrame: builder.mutation<SystemTimeFrame, CreateSystemTimeFrameRequest>({
      query: (body) => ({
        url: "/system-time-frames",
        method: "POST",
        data: body,
        headers: { "Content-Type": "application/ld+json" },
      }),
      invalidatesTags: [ApiTagTypes.SystemTimeFrame],
    }),
    updateSystemTimeFrame: builder.mutation<SystemTimeFrame, UpdateSystemTimeFrameRequest>({
      query: ({ id, ...body }) => ({
        url: `/system-time-frames/${id}`,
        method: "PUT",
        data: body,
        headers: { "Content-Type": "application/ld+json" },
      }),
      invalidatesTags: [ApiTagTypes.SystemTimeFrame],
    }),
    deleteSystemTimeFrame: builder.mutation<void, number>({
      query: (id) => ({ url: `/system-time-frames/${id}`, method: "DELETE" }),
      invalidatesTags: [ApiTagTypes.SystemTimeFrame],
    }),
    getSemesters: builder.query<PaginatedResponse<Semester>, SemesterListParams>({
      query: (params) => ({ url: "/semesters", method: "GET", params }),
      providesTags: [ApiTagTypes.SystemTimeFrame],
    }),
  }),
});

export const {
  useGetSystemTimeFramesQuery,
  useGetSystemTimeFrameQuery,
  useCreateSystemTimeFrameMutation,
  useUpdateSystemTimeFrameMutation,
  useDeleteSystemTimeFrameMutation,
  useGetSemestersQuery,
} = systemTimeFramesApi;

export default systemTimeFramesApi;

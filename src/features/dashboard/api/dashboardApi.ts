import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  AcademicStructureKpiDTO,
  DashboardFilterParams,
  DashboardOverviewDTO,
  StudentLifecycleKpiDTO,
} from "../types/dashboard";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query<DashboardOverviewDTO, DashboardFilterParams>({
      query: (params) => ({
        url: "/dashboard/overview",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.Dashboard],
      keepUnusedDataFor: 300,
    }),

    getAcademicStructureKpis: builder.query<
      AcademicStructureKpiDTO,
      DashboardFilterParams
    >({
      query: (params) => ({
        url: "/dashboard/academic-structure",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.Dashboard],
      keepUnusedDataFor: 300,
    }),

    getStudentLifecycleKpis: builder.query<
      StudentLifecycleKpiDTO,
      DashboardFilterParams
    >({
      query: (params) => ({
        url: "/dashboard/students",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.Dashboard],
      keepUnusedDataFor: 300,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardOverviewQuery,
  useGetAcademicStructureKpisQuery,
  useGetStudentLifecycleKpisQuery,
} = dashboardApi;

export default dashboardApi;

import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type { PaginatedResponse } from "../../courses/types/course";
import type {
    CourseConfigListParams,
    CourseConfiguration,
    CourseConfigurationGroupOption,
    CourseConfigurationGroupedParams,
    CreateCourseConfigRequest,
    UpdateCourseConfigRequest,
} from "../types/course-configuration";

const courseConfigurationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCourseConfigurations: builder.query<
      PaginatedResponse<CourseConfiguration>,
      CourseConfigListParams
    >({
      query: (params) => ({ url: "course-configurations", method: "GET", params }),
      providesTags: [{ type: ApiTagTypes.CourseConfiguration, id: "LIST" }],
    }),

    getCourseConfigurationsGrouped: builder.query<
      CourseConfigurationGroupOption[],
      CourseConfigurationGroupedParams
    >({
      query: (params) => ({
        url: "course-configurations/options-grouped",
        method: "GET",
        params,
      }),
      transformResponse: (
        response:
          | PaginatedResponse<CourseConfigurationGroupOption>
          | CourseConfigurationGroupOption[],
      ) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response?.member ?? [];
      },
      providesTags: [{ type: ApiTagTypes.CourseConfiguration, id: "GROUPED_OPTIONS" }],
    }),

    createCourseConfiguration: builder.mutation<
      CourseConfiguration,
      CreateCourseConfigRequest
    >({
      query: (body) => ({ url: "course-configurations", method: "POST", data: body }),
      invalidatesTags: [{ type: ApiTagTypes.CourseConfiguration, id: "LIST" }],
    }),

    updateCourseConfiguration: builder.mutation<
      CourseConfiguration,
      UpdateCourseConfigRequest
    >({
      query: ({ id, ...body }) => ({
        url: `course-configurations/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [{ type: ApiTagTypes.CourseConfiguration, id: "LIST" }],
    }),

    deleteCourseConfiguration: builder.mutation<void, number>({
      query: (id) => ({ url: `course-configurations/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: ApiTagTypes.CourseConfiguration, id: "LIST" }],
    }),
  }),
});

export const {
  useGetCourseConfigurationsQuery,
  useGetCourseConfigurationsGroupedQuery,
  useCreateCourseConfigurationMutation,
  useUpdateCourseConfigurationMutation,
  useDeleteCourseConfigurationMutation,
} = courseConfigurationsApi;

export default courseConfigurationsApi;

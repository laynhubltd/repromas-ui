import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  CreateJambCombinationGroupRequest,
  CreateJambCombinationOptionRequest,
  CreateJambSubjectCombinationRequest,
  JambCombinationGroup,
  JambCombinationGroupListParams,
  JambCombinationOption,
  JambCombinationOptionListParams,
  JambSubjectCombination,
  JambSubjectCombinationListParams,
  PaginatedResponse,
  UpdateJambCombinationGroupRequest,
  UpdateJambCombinationOptionRequest,
  UpdateJambSubjectCombinationRequest,
} from "../types/jamb-rule";

const jambRuleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getJambSubjectCombinations: builder.query<
      PaginatedResponse<JambSubjectCombination>,
      JambSubjectCombinationListParams
    >({
      query: (params) => ({
        url: "/jamb-subject-combinations",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.JambSubjectCombination],
    }),

    getJambSubjectCombination: builder.query<JambSubjectCombination, number>({
      query: (id) => ({
        url: `/jamb-subject-combinations/${id}`,
        method: "GET",
      }),
      providesTags: [ApiTagTypes.JambSubjectCombination],
    }),

    createJambSubjectCombination: builder.mutation<
      JambSubjectCombination,
      CreateJambSubjectCombinationRequest
    >({
      query: (body) => ({
        url: "/jamb-subject-combinations",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [
        ApiTagTypes.JambSubjectCombination,
        ApiTagTypes.JambCombinationGroup,
        ApiTagTypes.JambCombinationOption,
      ],
    }),

    updateJambSubjectCombination: builder.mutation<
      JambSubjectCombination,
      UpdateJambSubjectCombinationRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/jamb-subject-combinations/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.JambSubjectCombination],
    }),

    deleteJambSubjectCombination: builder.mutation<void, number>({
      query: (id) => ({
        url: `/jamb-subject-combinations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        ApiTagTypes.JambSubjectCombination,
        ApiTagTypes.JambCombinationGroup,
        ApiTagTypes.JambCombinationOption,
      ],
    }),

    getJambCombinationGroups: builder.query<
      PaginatedResponse<JambCombinationGroup>,
      JambCombinationGroupListParams
    >({
      query: (params) => ({
        url: "/jamb-combination-groups",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.JambCombinationGroup],
    }),

    getJambCombinationGroup: builder.query<JambCombinationGroup, number>({
      query: (id) => ({
        url: `/jamb-combination-groups/${id}`,
        method: "GET",
      }),
      providesTags: [ApiTagTypes.JambCombinationGroup],
    }),

    createJambCombinationGroup: builder.mutation<
      JambCombinationGroup,
      CreateJambCombinationGroupRequest
    >({
      query: (body) => ({
        url: "/jamb-combination-groups",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.JambCombinationGroup],
    }),

    updateJambCombinationGroup: builder.mutation<
      JambCombinationGroup,
      UpdateJambCombinationGroupRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/jamb-combination-groups/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.JambCombinationGroup],
    }),

    deleteJambCombinationGroup: builder.mutation<void, number>({
      query: (id) => ({
        url: `/jamb-combination-groups/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        ApiTagTypes.JambCombinationGroup,
        ApiTagTypes.JambCombinationOption,
      ],
    }),

    getJambCombinationOptions: builder.query<
      PaginatedResponse<JambCombinationOption>,
      JambCombinationOptionListParams
    >({
      query: (params) => ({
        url: "/jamb-combination-options",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.JambCombinationOption],
    }),

    getJambCombinationOption: builder.query<JambCombinationOption, number>({
      query: (id) => ({
        url: `/jamb-combination-options/${id}`,
        method: "GET",
      }),
      providesTags: [ApiTagTypes.JambCombinationOption],
    }),

    createJambCombinationOption: builder.mutation<
      JambCombinationOption,
      CreateJambCombinationOptionRequest
    >({
      query: (body) => ({
        url: "/jamb-combination-options",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.JambCombinationOption],
    }),

    updateJambCombinationOption: builder.mutation<
      JambCombinationOption,
      UpdateJambCombinationOptionRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/jamb-combination-options/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.JambCombinationOption],
    }),

    deleteJambCombinationOption: builder.mutation<void, number>({
      query: (id) => ({
        url: `/jamb-combination-options/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTagTypes.JambCombinationOption],
    }),
  }),
});

export const {
  useGetJambSubjectCombinationsQuery,
  useGetJambSubjectCombinationQuery,
  useCreateJambSubjectCombinationMutation,
  useUpdateJambSubjectCombinationMutation,
  useDeleteJambSubjectCombinationMutation,
  useGetJambCombinationGroupsQuery,
  useGetJambCombinationGroupQuery,
  useCreateJambCombinationGroupMutation,
  useUpdateJambCombinationGroupMutation,
  useDeleteJambCombinationGroupMutation,
  useGetJambCombinationOptionsQuery,
  useGetJambCombinationOptionQuery,
  useCreateJambCombinationOptionMutation,
  useUpdateJambCombinationOptionMutation,
  useDeleteJambCombinationOptionMutation,
} = jambRuleApi;

export default jambRuleApi;

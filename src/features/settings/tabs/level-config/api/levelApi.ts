import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
    CreateLevelRequest,
    Level,
    LevelListParams,
    PaginatedResponse,
    UpdateLevelRequest,
} from "../types/level";
import type {
    CreateLevelCategoryRequest,
    LevelCategory,
    UpdateLevelCategoryRequest,
} from "../types/levelCategory";

const levelApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLevelCategories: builder.query<PaginatedResponse<LevelCategory>, LevelListParams>({
      query: (params) => ({ url: "/level-categories", method: "GET", params }),
      providesTags: [{ type: ApiTagTypes.LevelCategory, id: "LIST" }],
    }),
    createLevelCategory: builder.mutation<LevelCategory, CreateLevelCategoryRequest>({
      query: (body) => ({ url: "/level-categories", method: "POST", data: body }),
      invalidatesTags: [{ type: ApiTagTypes.LevelCategory, id: "LIST" }],
    }),
    updateLevelCategory: builder.mutation<LevelCategory, { id: number } & UpdateLevelCategoryRequest>({
      query: ({ id, ...body }) => ({ url: `/level-categories/${id}`, method: "PUT", data: body }),
      invalidatesTags: (result) => [
        { type: ApiTagTypes.LevelCategory, id: result?.id },
        { type: ApiTagTypes.LevelCategory, id: "LIST" },
      ],
    }),
    deleteLevelCategory: builder.mutation<void, number>({
      query: (id) => ({ url: `/level-categories/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: ApiTagTypes.LevelCategory, id: "LIST" }],
    }),
    getLevels: builder.query<PaginatedResponse<Level>, LevelListParams>({
      query: (params) => ({ url: "/levels", method: "GET", params }),
      providesTags: [{ type: ApiTagTypes.Level, id: "LIST" }],
    }),
    createLevel: builder.mutation<Level, CreateLevelRequest>({
      query: (body) => ({ url: "/levels", method: "POST", data: body }),
      invalidatesTags: [
        { type: ApiTagTypes.Level, id: "LIST" },
        ApiTagTypes.SetupStatus,
      ],
    }),
    updateLevel: builder.mutation<Level, { id: number } & UpdateLevelRequest>({
      query: ({ id, ...body }) => ({ url: `/levels/${id}`, method: "PUT", data: body }),
      invalidatesTags: (result) => [
        { type: ApiTagTypes.Level, id: result?.id },
        { type: ApiTagTypes.Level, id: "LIST" },
      ],
    }),
    deleteLevel: builder.mutation<void, number>({
      query: (id) => ({ url: `/levels/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: ApiTagTypes.Level, id: "LIST" }],
    }),
  }),
});

export const {
  useGetLevelsQuery,
  useCreateLevelMutation,
  useUpdateLevelMutation,
  useDeleteLevelMutation,
  useGetLevelCategoriesQuery,
  useCreateLevelCategoryMutation,
  useUpdateLevelCategoryMutation,
  useDeleteLevelCategoryMutation,
} = levelApi;

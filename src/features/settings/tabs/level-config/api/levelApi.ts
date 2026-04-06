import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
    CreateLevelRequest,
    Level,
    LevelListParams,
    PaginatedResponse,
    UpdateLevelRequest,
} from "../types/level";

const levelApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLevels: builder.query<PaginatedResponse<Level>, LevelListParams>({
      query: (params) => ({ url: "/levels", method: "GET", params }),
      providesTags: [{ type: ApiTagTypes.Level, id: "LIST" }],
    }),
    createLevel: builder.mutation<Level, CreateLevelRequest>({
      query: (body) => ({ url: "/levels", method: "POST", data: body }),
      invalidatesTags: [{ type: ApiTagTypes.Level, id: "LIST" }],
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
} = levelApi;

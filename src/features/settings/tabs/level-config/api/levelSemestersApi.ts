import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  LevelSemester,
  LevelSemestersQueryParams,
} from "@/shared/types/level-semester";

export interface PaginatedLevelSemestersResponse {
  totalItems: number;
  member: LevelSemester[];
}

export const levelSemestersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLevelSemesters: builder.query<
      PaginatedLevelSemestersResponse,
      { levelId: number; params?: LevelSemestersQueryParams }
    >({
      query: ({ levelId, params }) => ({
        url: `/levels/${levelId}/semesters`,
        method: "GET",
        params,
      }),
      providesTags: (result) => [
        { type: ApiTagTypes.Semester, id: "LIST" },
        ...(result?.member?.map((s) => ({ type: ApiTagTypes.Semester, id: s.id })) ?? []),
      ],
    }),
  }),
});

export const { useGetLevelSemestersQuery, useLazyGetLevelSemestersQuery } =
  levelSemestersApi;

import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type { SemesterTypesResponse } from "../types/course-registration";

const semesterTypesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Fetches all semester types for the tenant, sorted by sortOrder ascending.
     * Used to populate the semester type selector dropdown.
     *
     * GET /api/semester-types
     */
    getSemesterTypes: builder.query<SemesterTypesResponse, void>({
      query: () => ({
        url: "semester-types",
        method: "GET",
        params: { sort: "sortOrder:asc", itemsPerPage: 100 },
      }),
      providesTags: [{ type: ApiTagTypes.SemesterType, id: "LIST" }],
    }),
  }),
});

export const { useGetSemesterTypesQuery } = semesterTypesApi;

export default semesterTypesApi;

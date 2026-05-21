import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type { PaginatedResponse } from "../types/geography-rule";
import type { NigerianState, StateListParams } from "../types/state";

const statesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStates: builder.query<PaginatedResponse<NigerianState>, StateListParams>({
      query: (params) => ({
        url: "/states",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.State],
    }),
  }),
});

export const { useGetStatesQuery } = statesApi;

export default statesApi;

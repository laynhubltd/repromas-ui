import { baseApi } from "@/app/api/baseApi";
import type { BuilderContract } from "@/features/dynamic-form/types";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import { normalizeBuilderContract } from "../utils/normalizeBuilderContract";

const builderContractApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBuilderContract: builder.query<BuilderContract, void>({
      query: () => ({
        url: "/dynamic-form-builder-contract",
        method: "GET",
      }),
      transformResponse: (raw: unknown) => normalizeBuilderContract(raw),
      providesTags: [{ type: ApiTagTypes.DynamicForm, id: "CONTRACT" }],
    }),
  }),
});

export const { useGetBuilderContractQuery } = builderContractApi;

export default builderContractApi;

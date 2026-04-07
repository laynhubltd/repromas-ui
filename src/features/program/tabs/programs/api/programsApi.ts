import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
    CreateProgramRequest,
    PaginatedResponse,
    Program,
    ProgramListParams,
    UpdateProgramRequest,
} from "../types/program";

const programsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPrograms: builder.query<PaginatedResponse<Program>, ProgramListParams>({
      query: (params) => ({ url: "programs", method: "GET", params }),
      providesTags: [{ type: ApiTagTypes.Program, id: "LIST" }],
    }),

    createProgram: builder.mutation<Program, CreateProgramRequest>({
      query: (body) => ({ url: "programs", method: "POST", data: body }),
      invalidatesTags: [{ type: ApiTagTypes.Program, id: "LIST" }],
    }),

    updateProgram: builder.mutation<Program, { id: number } & UpdateProgramRequest>({
      query: ({ id, ...body }) => ({ url: `programs/${id}`, method: "PUT", data: body }),
      invalidatesTags: [{ type: ApiTagTypes.Program, id: "LIST" }],
    }),

    deleteProgram: builder.mutation<void, number>({
      query: (id) => ({ url: `programs/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: ApiTagTypes.Program, id: "LIST" }],
    }),
  }),
});

export const {
  useGetProgramsQuery,
  useCreateProgramMutation,
  useUpdateProgramMutation,
  useDeleteProgramMutation,
} = programsApi;

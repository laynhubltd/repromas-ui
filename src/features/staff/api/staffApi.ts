import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
    CreateStaffRequest,
    PaginatedResponse,
    Staff,
    StaffListParams,
    UpdateStaffRequest,
} from "../types/staff";

const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaffList: builder.query<PaginatedResponse<Staff>, StaffListParams>({
      query: (params) => ({ url: "academic/staff", method: "GET", params }),
      providesTags: [{ type: ApiTagTypes.Staff, id: "LIST" }],
    }),

    getStaff: builder.query<Staff, { id: number; include?: string }>({
      query: ({ id, include }) => ({
        url: `academic/staff/${id}`,
        method: "GET",
        params: include ? { include } : undefined,
      }),
      providesTags: (_result, _err, { id }) => [{ type: ApiTagTypes.Staff, id }],
    }),

    createStaff: builder.mutation<Staff, CreateStaffRequest>({
      query: (body) => ({ url: "academic/staff", method: "POST", data: body }),
      invalidatesTags: [{ type: ApiTagTypes.Staff, id: "LIST" }],
    }),

    updateStaff: builder.mutation<Staff, { id: number } & UpdateStaffRequest>({
      query: ({ id, ...body }) => ({ url: `academic/staff/${id}`, method: "PUT", data: body }),
      invalidatesTags: [{ type: ApiTagTypes.Staff, id: "LIST" }],
    }),

    deleteStaff: builder.mutation<void, { id: number }>({
      query: ({ id }) => ({ url: `academic/staff/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: ApiTagTypes.Staff, id: "LIST" }],
    }),
  }),
});

export const {
  useGetStaffListQuery,
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
} = staffApi;

export default staffApi;

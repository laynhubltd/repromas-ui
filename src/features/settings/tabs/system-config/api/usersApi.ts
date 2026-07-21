import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";

export type UserOption = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
};

type UsersListResponse = {
  member: UserOption[];
  totalItems: number;
};

type UsersListParams = {
  itemsPerPage?: number;
};

const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/users — datasource for signatory user select
    getUsers: builder.query<UsersListResponse, UsersListParams>({
      query: (params) => ({ url: "/auth/users", method: "GET", params }),
      providesTags: [{ type: ApiTagTypes.User, id: "LIST" }],
    }),
  }),
});

export const { useGetUsersQuery } = usersApi;

export default usersApi;

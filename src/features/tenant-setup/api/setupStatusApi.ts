import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type { SetupChecklistResponse } from "../types/setup";

const setupStatusApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSetupChecklist: builder.query<SetupChecklistResponse, void>({
      query: () => ({
        url: "/setup-checklist",
        method: "GET",
      }),
      providesTags: [ApiTagTypes.SetupStatus],
    }),
  }),
});

export const { useGetSetupChecklistQuery } = setupStatusApi;

export default setupStatusApi;

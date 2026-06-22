import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type { MeAdmissionProgress } from "../types/me-admission-progress";
import { mapMeAdmissionProgress } from "../utils/mapMeAdmissionProgress";

const meAdmissionProgressApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMeAdmissionProgress: builder.query<MeAdmissionProgress, void>({
      query: () => ({
        url: "/me/admission-progress",
        method: "GET",
      }),
      transformResponse: (raw) => mapMeAdmissionProgress(raw),
      providesTags: [ApiTagTypes.MeAdmissionProgress],
    }),
  }),
});

export const { useGetMeAdmissionProgressQuery } = meAdmissionProgressApi;

export default meAdmissionProgressApi;

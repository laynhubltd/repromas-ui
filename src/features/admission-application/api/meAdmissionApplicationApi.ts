import { baseApi } from "@/app/api/baseApi";
import { ME_ADMISSION_APPLICATION_DOSSIER_INCLUDE } from "../constants/meAdmissionApplicationOptions";
import type { MeAdmissionApplication } from "../types/me-admission-application";
import { mapMeAdmissionApplication } from "../utils/mapMeAdmissionApplication";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";

export type GetMeAdmissionApplicationArgs = {
  include?: string;
};

const meAdmissionApplicationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMeAdmissionApplication: builder.query<
      MeAdmissionApplication,
      GetMeAdmissionApplicationArgs | void
    >({
      query: (arg) => ({
        url: "/me/admission-application",
        method: "GET",
        params: {
          include: arg?.include ?? ME_ADMISSION_APPLICATION_DOSSIER_INCLUDE,
        },
      }),
      transformResponse: (raw) => mapMeAdmissionApplication(raw),
      providesTags: [ApiTagTypes.MeAdmissionApplication],
    }),
  }),
});

export const { useGetMeAdmissionApplicationQuery } = meAdmissionApplicationApi;

export default meAdmissionApplicationApi;

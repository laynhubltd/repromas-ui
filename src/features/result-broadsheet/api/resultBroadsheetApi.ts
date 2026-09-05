import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  BroadsheetFilterParams,
  BroadsheetReport,
} from "../types/result-broadsheet";

function unwrapBroadsheetResponse(response: unknown): BroadsheetReport {
  if (Array.isArray(response)) {
    return response[0] as BroadsheetReport;
  }
  if (response && typeof response === "object") {
    const obj = response as Record<string, unknown>;
    if (Array.isArray(obj.member) && obj.member.length > 0) {
      return obj.member[0] as BroadsheetReport;
    }
    if (Array.isArray(obj["hydra:member"]) && (obj["hydra:member"] as unknown[]).length > 0) {
      return (obj["hydra:member"] as unknown[])[0] as BroadsheetReport;
    }
    if (Array.isArray(obj.data) && obj.data.length > 0) {
      return obj.data[0] as BroadsheetReport;
    }
    if (obj.data && typeof obj.data === "object") {
      return obj.data as BroadsheetReport;
    }
  }
  return response as BroadsheetReport;
}

const resultBroadsheetApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBroadsheetReport: builder.query<BroadsheetReport, BroadsheetFilterParams>({
      query: (params) => ({
        url: "/results/broadsheet",
        method: "GET",
        params,
      }),
      transformResponse: (response: unknown) => unwrapBroadsheetResponse(response),
      providesTags: [ApiTagTypes.BroadsheetReport],
    }),
  }),
});

export const { useGetBroadsheetReportQuery, useLazyGetBroadsheetReportQuery } =
  resultBroadsheetApi;
export default resultBroadsheetApi;

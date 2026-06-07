import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type { PaginatedResponse } from "../types/geography-rule";
import type { NigerianLga } from "../types/lga";
import type {
  NigerianState,
  NigerianStateWithLgas,
  StateListParams,
} from "../types/state";

function normalizeLga(raw: unknown): NigerianLga {
  const lga = raw as Record<string, unknown>;
  const stateRef = lga.state as Record<string, unknown> | undefined;
  return {
    id: typeof lga.id === "number" ? lga.id : 0,
    name: typeof lga.name === "string" ? lga.name : "",
    code: typeof lga.code === "string" ? lga.code : undefined,
    stateId:
      typeof lga.stateId === "number"
        ? lga.stateId
        : typeof stateRef?.id === "number"
          ? stateRef.id
          : undefined,
  };
}

function normalizeState(raw: unknown): NigerianState {
  const data = raw as Record<string, unknown>;
  return {
    id: typeof data.id === "number" ? data.id : 0,
    name: typeof data.name === "string" ? data.name : "",
    code: typeof data.code === "string" ? data.code : "",
    countryCode:
      typeof data.countryCode === "string"
        ? data.countryCode
        : typeof data.country_code === "string"
          ? data.country_code
          : "",
  };
}

function normalizeStateWithLgas(raw: unknown): NigerianStateWithLgas {
  const data = raw as Record<string, unknown>;
  const lgasRaw = data.lgas;
  const lgas = Array.isArray(lgasRaw)
    ? lgasRaw.map(normalizeLga).filter((l) => l.id > 0)
    : [];

  return {
    id: typeof data.id === "number" ? data.id : 0,
    name: typeof data.name === "string" ? data.name : "",
    code: typeof data.code === "string" ? data.code : "",
    countryCode:
      typeof data.countryCode === "string" ? data.countryCode : "",
    lgas,
  };
}

const statesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStates: builder.query<PaginatedResponse<NigerianState>, StateListParams>({
      query: (params) => ({
        url: "/states",
        method: "GET",
        params,
      }),
      transformResponse: (raw: unknown) => {
        const data = raw as Record<string, unknown>;
        const member = Array.isArray(data.member) ? data.member : [];
        return {
          member: member.map(normalizeState).filter((s) => s.id > 0),
          totalItems:
            typeof data.totalItems === "number"
              ? data.totalItems
              : typeof data.total_items === "number"
                ? data.total_items
                : member.length,
        };
      },
      providesTags: [ApiTagTypes.State],
    }),

    /** LGAs for a state via state relation (?include=lgas). */
    getStateWithLgas: builder.query<NigerianStateWithLgas, number>({
      query: (stateId) => ({
        url: `/states/${stateId}`,
        method: "GET",
        params: { include: "lgas" },
      }),
      transformResponse: normalizeStateWithLgas,
      providesTags: (_result, _err, stateId) => [
        { type: ApiTagTypes.State, id: stateId },
      ],
    }),

    /** LGAs filtered by state relation (list fallback). */
    getLgasByState: builder.query<
      PaginatedResponse<NigerianLga>,
      { stateId: number; itemsPerPage?: number }
    >({
      query: ({ stateId, itemsPerPage = 200 }) => ({
        url: "/lgas",
        method: "GET",
        params: {
          "exact[state]": stateId,
          itemsPerPage,
          sort: "name:asc",
        },
      }),
      transformResponse: (raw: unknown) => {
        const data = raw as Record<string, unknown>;
        const member = Array.isArray(data.member) ? data.member : [];
        return {
          member: member.map(normalizeLga).filter((l) => l.id > 0),
          totalItems:
            typeof data.totalItems === "number"
              ? data.totalItems
              : member.length,
        };
      },
    }),
  }),
});

export const {
  useGetStatesQuery,
  useGetStateWithLgasQuery,
  useGetLgasByStateQuery,
} = statesApi;

export default statesApi;

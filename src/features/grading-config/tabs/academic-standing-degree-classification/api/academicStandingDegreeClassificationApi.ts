import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  CreateDegreeClassificationRequest,
  DegreeClassificationBand,
  DegreeClassificationListParams,
  DegreeClassificationListResponse,
  UpdateDegreeClassificationRequest,
} from "../types/academic-standing-degree-classification";

function unwrapListResponse(response: unknown): DegreeClassificationListResponse {
  if (!response) {
    return { totalItems: 0, member: [] };
  }
  if (Array.isArray(response)) {
    return { totalItems: response.length, member: response as DegreeClassificationBand[] };
  }
  if (typeof response === "object" && response !== null) {
    const obj = response as Record<string, unknown>;
    const members =
      (obj.member as DegreeClassificationBand[]) ??
      (obj["hydra:member"] as DegreeClassificationBand[]) ??
      (obj.data as DegreeClassificationBand[]) ??
      [];
    const totalItems =
      (obj.totalItems as number) ??
      (obj["hydra:totalItems"] as number) ??
      members.length;
    return {
      totalItems,
      member: Array.isArray(members) ? members : [],
    };
  }
  return { totalItems: 0, member: [] };
}

const academicStandingDegreeClassificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAcademicStandingDegreeClassifications: builder.query<
      DegreeClassificationListResponse,
      DegreeClassificationListParams
    >({
      query: (params) => {
        const queryParams: Record<string, unknown> = {
          itemsPerPage: params.itemsPerPage ?? 50,
          page: params.page ?? 1,
          sort: params.sort ?? "rankOrder",
        };
        const standingId =
          params.academicStandingId ??
          params["filters[academicStandingId]"] ??
          params["exact[academicStandingId]"];
        if (standingId !== undefined) {
          queryParams["filters[academicStandingId]"] = standingId;
          queryParams["exact[academicStandingId]"] = standingId;
        }
        if (params["filters[name]"]) {
          queryParams["filters[name]"] = params["filters[name]"];
        }
        if (params.include) {
          queryParams.include = params.include;
        }
        return {
          url: "/academic-standing-degree-classifications",
          method: "GET",
          params: queryParams,
        };
      },
      transformResponse: (response: unknown) => unwrapListResponse(response),
      providesTags: [ApiTagTypes.AcademicStandingDegreeClassification],
    }),

    getAcademicStandingDegreeClassificationById: builder.query<
      DegreeClassificationBand,
      number
    >({
      query: (id) => ({
        url: `/academic-standing-degree-classifications/${id}`,
        method: "GET",
        params: {
          include: "academicStanding",
        },
      }),
      providesTags: (_res, _err, id) => [
        { type: ApiTagTypes.AcademicStandingDegreeClassification, id },
      ],
    }),

    createAcademicStandingDegreeClassification: builder.mutation<
      DegreeClassificationBand,
      CreateDegreeClassificationRequest
    >({
      query: (body) => ({
        url: "/academic-standing-degree-classifications",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [
        ApiTagTypes.AcademicStandingDegreeClassification,
        ApiTagTypes.AcademicStanding,
      ],
    }),

    updateAcademicStandingDegreeClassification: builder.mutation<
      DegreeClassificationBand,
      UpdateDegreeClassificationRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/academic-standing-degree-classifications/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [
        ApiTagTypes.AcademicStandingDegreeClassification,
        ApiTagTypes.AcademicStanding,
      ],
    }),

    deleteAcademicStandingDegreeClassification: builder.mutation<void, number>({
      query: (id) => ({
        url: `/academic-standing-degree-classifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        ApiTagTypes.AcademicStandingDegreeClassification,
        ApiTagTypes.AcademicStanding,
      ],
    }),
  }),
});

export const {
  useGetAcademicStandingDegreeClassificationsQuery,
  useGetAcademicStandingDegreeClassificationByIdQuery,
  useCreateAcademicStandingDegreeClassificationMutation,
  useUpdateAcademicStandingDegreeClassificationMutation,
  useDeleteAcademicStandingDegreeClassificationMutation,
} = academicStandingDegreeClassificationApi;
export default academicStandingDegreeClassificationApi;

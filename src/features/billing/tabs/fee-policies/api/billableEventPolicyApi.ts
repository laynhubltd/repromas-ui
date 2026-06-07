import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  BillableEventPolicy,
  BillableEventPolicyListParams,
  BillableEventPolicySeedRequest,
  BillableEventPolicySeedResult,
  PaginatedResponse,
  PublishBillableEventPolicyRequest,
  ReviseBillableEventPolicyRequest,
} from "../types/billable-event-policy";

const billableEventPolicyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBillableEventPolicies: builder.query<
      PaginatedResponse<BillableEventPolicy>,
      BillableEventPolicyListParams
    >({
      query: (params) => ({
        url: "/billing/billable-event-policies",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.BillableEventPolicy],
    }),

    getBillableEventPolicy: builder.query<BillableEventPolicy, number>({
      query: (id) => ({
        url: `/billing/billable-event-policies/${id}`,
        method: "GET",
      }),
      providesTags: [ApiTagTypes.BillableEventPolicy],
    }),

    publishBillableEventPolicy: builder.mutation<
      BillableEventPolicy,
      PublishBillableEventPolicyRequest
    >({
      query: (body) => ({
        url: "/billing/billable-event-policies",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [
        ApiTagTypes.BillableEventPolicy,
        ApiTagTypes.BillableEvent,
      ],
    }),

    reviseBillableEventPolicy: builder.mutation<
      BillableEventPolicy,
      { id: number; body: ReviseBillableEventPolicyRequest }
    >({
      query: ({ id, body }) => ({
        url: `/billing/billable-event-policies/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [
        ApiTagTypes.BillableEventPolicy,
        ApiTagTypes.BillableEvent,
      ],
    }),

    deleteBillableEventPolicy: builder.mutation<void, number>({
      query: (id) => ({
        url: `/billing/billable-event-policies/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        ApiTagTypes.BillableEventPolicy,
        ApiTagTypes.BillableEvent,
      ],
    }),

    seedBillableEventPoliciesFromCatalog: builder.mutation<
      BillableEventPolicySeedResult,
      BillableEventPolicySeedRequest | void
    >({
      query: (body) => ({
        url: "/billing/billable-event-policies/seed-from-catalog",
        method: "POST",
        data: body ?? { implementedOnly: true, skipExisting: true },
      }),
      invalidatesTags: [
        ApiTagTypes.BillableEventPolicy,
        ApiTagTypes.BillableEvent,
      ],
    }),
  }),
});

export const {
  useGetBillableEventPoliciesQuery,
  useGetBillableEventPolicyQuery,
  usePublishBillableEventPolicyMutation,
  useReviseBillableEventPolicyMutation,
  useDeleteBillableEventPolicyMutation,
  useSeedBillableEventPoliciesFromCatalogMutation,
} = billableEventPolicyApi;

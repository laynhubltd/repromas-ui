import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  BillableEvent,
  BillableEventCatalogEntry,
  BillableEventCatalogEntryParams,
  BillableEventCatalogListParams,
  BillableEventListParams,
  BillableEventSeedRequest,
  BillableEventSeedResult,
  CreateBillableEventRequest,
  PaginatedResponse,
  UpdateBillableEventRequest,
} from "../types/billable-event";

const billableEventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBillableEvents: builder.query<
      PaginatedResponse<BillableEvent>,
      BillableEventListParams
    >({
      query: (params) => ({
        url: "/billing/billable-events",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.BillableEvent],
    }),

    getBillableEvent: builder.query<BillableEvent, number>({
      query: (id) => ({
        url: `/billing/billable-events/${id}`,
        method: "GET",
      }),
      providesTags: [ApiTagTypes.BillableEvent],
    }),

    getBillableEventCatalog: builder.query<
      PaginatedResponse<BillableEventCatalogEntry>,
      BillableEventCatalogListParams | void
    >({
      query: (params) => ({
        url: "/billing/billable-event-catalog",
        method: "GET",
        params: params ?? { implementedOnly: true },
      }),
      providesTags: [ApiTagTypes.BillableEvent],
    }),

    getBillableEventCatalogEntry: builder.query<
      BillableEventCatalogEntry,
      BillableEventCatalogEntryParams
    >({
      query: ({ code, paymentTiming }) => ({
        url: `/billing/billable-event-catalog/${code}`,
        method: "GET",
        params: paymentTiming ? { paymentTiming } : undefined,
      }),
    }),

    createBillableEvent: builder.mutation<
      BillableEvent,
      CreateBillableEventRequest
    >({
      query: (body) => ({
        url: "/billing/billable-events",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.BillableEvent],
    }),

    updateBillableEvent: builder.mutation<
      BillableEvent,
      { id: number; body: UpdateBillableEventRequest }
    >({
      query: ({ id, body }) => ({
        url: `/billing/billable-events/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.BillableEvent],
    }),

    deleteBillableEvent: builder.mutation<void, number>({
      query: (id) => ({
        url: `/billing/billable-events/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTagTypes.BillableEvent],
    }),

    seedBillableEventsFromCatalog: builder.mutation<
      BillableEventSeedResult,
      BillableEventSeedRequest | void
    >({
      query: (body) => ({
        url: "/billing/billable-events/seed-from-catalog",
        method: "POST",
        data: body ?? { implementedOnly: true, skipExisting: true },
      }),
      invalidatesTags: [ApiTagTypes.BillableEvent],
    }),
  }),
});

export const {
  useGetBillableEventsQuery,
  useGetBillableEventQuery,
  useGetBillableEventCatalogQuery,
  useLazyGetBillableEventCatalogEntryQuery,
  useCreateBillableEventMutation,
  useUpdateBillableEventMutation,
  useDeleteBillableEventMutation,
  useSeedBillableEventsFromCatalogMutation,
} = billableEventApi;

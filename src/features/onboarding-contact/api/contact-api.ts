import { baseApi } from "@/app/api/baseApi";
import type { ContactRequestPayload, ContactRequestReceipt } from "../types";

/** Public, tenant-less endpoint (whitelisted for the apex host in `apex-endpoint-whitelist.ts`). */
const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitContactRequest: builder.mutation<ContactRequestReceipt, ContactRequestPayload>({
      query: (body) => ({
        url: "/contact-requests",
        method: "POST",
        data: body,
        headers: { "Content-Type": "application/ld+json", Accept: "application/json" },
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useSubmitContactRequestMutation } = contactApi;

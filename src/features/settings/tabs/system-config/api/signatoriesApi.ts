import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  SignatoriesConfig,
  SignatoryRenderItem,
  SignatureUploadResponse,
  UpsertSignatoriesRequest,
  ApplyToValue,
} from "../types/signatories";

const signatoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/signatories — 200 (exists) or 404 (not configured yet)
    getSignatories: builder.query<SignatoriesConfig, void>({
      query: () => ({ url: "/signatories", method: "GET" }),
      providesTags: [{ type: ApiTagTypes.Signatories, id: "SINGLE" }],
    }),

    // GET /api/signatories/{documentType}/render
    // Returns active signatories for the given document type, sorted by order.
    getSignatoriesRender: builder.query<SignatoryRenderItem[], ApplyToValue>({
      query: (documentType) => ({
        url: `/signatories/${documentType}/render`,
        method: "GET",
      }),
      providesTags: (_result, _error, documentType) => [
        { type: ApiTagTypes.Signatories, id: `RENDER_${documentType}` },
      ],
    }),

    // POST /api/signatories — first-time creation (isCreate === true)
    createSignatories: builder.mutation<
      SignatoriesConfig,
      UpsertSignatoriesRequest
    >({
      query: (body) => ({
        url: "/signatories",
        method: "POST",
        data: body,
        headers: { "Content-Type": "application/ld+json" },
      }),
      invalidatesTags: [{ type: ApiTagTypes.Signatories, id: "SINGLE" }],
    }),

    // PUT /api/signatories — update existing config (isCreate === false)
    updateSignatories: builder.mutation<
      SignatoriesConfig,
      UpsertSignatoriesRequest
    >({
      query: (body) => ({
        url: "/signatories",
        method: "PUT",
        data: body,
        headers: { "Content-Type": "application/ld+json" },
      }),
      invalidatesTags: [{ type: ApiTagTypes.Signatories, id: "SINGLE" }],
    }),

    // POST /api/signatories/signature-upload — multipart upload, returns storagePath + publicUrl
    uploadSignature: builder.mutation<SignatureUploadResponse, FormData>({
      query: (formData) => ({
        url: "/signatories/signature-upload",
        method: "POST",
        data: formData,
        // Do NOT set Content-Type — browser sets multipart boundary automatically
      }),
    }),
  }),
});

export const {
  useGetSignatoriesQuery,
  useGetSignatoriesRenderQuery,
  useCreateSignatoriesMutation,
  useUpdateSignatoriesMutation,
  useUploadSignatureMutation,
} = signatoriesApi;

export default signatoriesApi;

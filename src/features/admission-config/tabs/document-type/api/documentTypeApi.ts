import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  AdmissionDocumentType,
  CreateDocumentTypeRequest,
  DocumentTypeListParams,
  PaginatedDocumentTypeResponse,
  UpdateDocumentTypeRequest,
} from "../types/document-type";

const documentTypeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // GET /api/admission-document-types
    getDocumentTypes: builder.query<
      PaginatedDocumentTypeResponse,
      DocumentTypeListParams
    >({
      query: (params) => ({
        url: "/admission-document-types",
        method: "GET",
        params,
      }),
      providesTags: [{ type: ApiTagTypes.AdmissionDocumentType, id: "LIST" }],
    }),

    // GET /api/admission-document-types/{id}
    getDocumentType: builder.query<AdmissionDocumentType, { id: number }>({
      query: ({ id }) => ({
        url: `/admission-document-types/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _err, { id }) => [
        { type: ApiTagTypes.AdmissionDocumentType, id },
      ],
    }),

    // POST /api/admission-document-types
    createDocumentType: builder.mutation<
      AdmissionDocumentType,
      CreateDocumentTypeRequest
    >({
      query: (body) => ({
        url: "/admission-document-types",
        method: "POST",
        data: body,
        headers: { "Content-Type": "application/ld+json" },
      }),
      invalidatesTags: [{ type: ApiTagTypes.AdmissionDocumentType, id: "LIST" }],
    }),

    // PUT /api/admission-document-types/{id}
    updateDocumentType: builder.mutation<
      AdmissionDocumentType,
      { id: number } & UpdateDocumentTypeRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/admission-document-types/${id}`,
        method: "PUT",
        data: body,
        headers: { "Content-Type": "application/ld+json" },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: ApiTagTypes.AdmissionDocumentType, id: "LIST" },
        { type: ApiTagTypes.AdmissionDocumentType, id },
      ],
    }),

    // DELETE /api/admission-document-types/{id}
    deleteDocumentType: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admission-document-types/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: ApiTagTypes.AdmissionDocumentType, id: "LIST" }],
    }),
  }),
});

export const {
  useGetDocumentTypesQuery,
  useGetDocumentTypeQuery,
  useCreateDocumentTypeMutation,
  useUpdateDocumentTypeMutation,
  useDeleteDocumentTypeMutation,
} = documentTypeApi;

export default documentTypeApi;

import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DocumentUploadStatus = "PENDING" | "VERIFIED" | "REJECTED";

export type DocumentUpload = {
  id: number;
  documentTypeId: number;
  documentTypeCode: string;
  actorType: string;
  actorId: number;
  submissionId: number | null;
  sectionId: number | null;
  fieldKey: string | null;
  storagePath: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  status: DocumentUploadStatus;
  rejectionReason: string | null;
  /** Pre-signed URL for viewing the file — expires; re-fetch to refresh */
  url?: string | null;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type UploadDocumentRequest = {
  file: File;
  documentTypeId: number;
  actorType: string;
  actorId: number;
};

export type DocumentUploadListParams = {
  "exact[actorType]"?: string;
  "exact[actorId]"?: number;
  "exact[status]"?: DocumentUploadStatus;
  include?: string;
  sort?: string;
  itemsPerPage?: number;
};

export type PaginatedDocumentUploads = {
  totalItems: number;
  member: DocumentUpload[];
};

const documentUploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /api/admission-document-uploads
     * Lists uploads for a given actor. Pass actorType + actorId to filter.
     */
    getDocumentUploads: builder.query<
      PaginatedDocumentUploads,
      DocumentUploadListParams
    >({
      query: (params) => ({
        url: "/admission-document-uploads",
        method: "GET",
        params,
      }),
      providesTags: [{ type: ApiTagTypes.AdmissionDocumentUpload, id: "LIST" }],
    }),

    /**
     * POST /api/admission-document-uploads (multipart/form-data)
     *
     * Accepts a pre-built FormData — caller appends:
     *   file, documentTypeId, actorType, actorId
     *
     * Follows the same pattern as bulkUploadCourses / capsBulkUpload:
     * pass FormData as data with no headers override — axios detects
     * FormData and sets multipart/form-data with boundary automatically.
     */
    uploadDocument: builder.mutation<DocumentUpload, FormData>({
      query: (formData) => ({
        url: "/admission-document-uploads",
        method: "POST",
        data: formData,
      }),
      invalidatesTags: [
        { type: ApiTagTypes.AdmissionDocumentUpload, id: "LIST" },
      ],
    }),

    /**
     * GET /api/admission-document-uploads/{id}
     *
     * Retrieves a single upload record with a fresh pre-signed URL.
     * Use this to refresh an expired prefill.url — do not cache the URL itself.
     */
    getDocumentUpload: builder.query<DocumentUpload, number>({
      query: (id) => ({
        url: `/admission-document-uploads/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => [
        { type: ApiTagTypes.AdmissionDocumentUpload, id },
      ],
    }),
  }),
});

export const {
  useGetDocumentUploadsQuery,
  useUploadDocumentMutation,
  useGetDocumentUploadQuery,
} = documentUploadApi;

export default documentUploadApi;

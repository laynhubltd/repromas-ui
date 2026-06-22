// Domain types for Admission Document Type sub-feature
// All types use `type` keyword per agent.md rules

export type AdmissionDocumentType = {
  id: number;
  code: string;             // immutable after creation; lowercase slug
  name: string;
  description: string | null;
  mimeTypes: string[];
  maxSizeMb: number;
  isRequired: boolean;
  isActive: boolean;
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
};

/**
 * POST body — isActive is NEVER sent on create (always true for new types).
 */
export type CreateDocumentTypeRequest = {
  code: string;
  name: string;
  description?: string | null;
  mimeTypes: string[];
  maxSizeMb: number;
  isRequired?: boolean;
};

/**
 * PUT body — full replace of all mutable fields.
 * isActive MUST always be sent explicitly.
 * code is immutable and must NOT be sent.
 */
export type UpdateDocumentTypeRequest = {
  name: string;
  description: string | null;
  mimeTypes: string[];
  maxSizeMb: number;
  isRequired: boolean;
  isActive: boolean;
};

export type DocumentTypeListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "search[name]"?: string;
  "exact[isActive]"?: boolean;
  "exact[isRequired]"?: boolean;
};

export type PaginatedDocumentTypeResponse = {
  totalItems: number;
  member: AdmissionDocumentType[];
};

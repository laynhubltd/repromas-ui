// Student status and entry mode enums

export type StudentStatus = 'ACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'WITHDRAWN' | 'RUSTICATED';

export type EntryMode = 'UTME' | 'DIRECT_ENTRY' | 'TRANSFER';

// Core entity — relationship fields are null unless included via ?include=

export type Student = {
  id: number;
  matricNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  entryMode: EntryMode;
  programId: number;
  entryLevelId: number;
  currentLevelId: number;
  curriculumVersionId: number;
  status: StudentStatus;
  metaData: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  // relationship fields (null unless included)
  program?: {
    id: number;
    name: string;
    department?: {
      id: number;
      name: string;
      faculty?: { id: number; name: string };
    };
  } | null;
  entryLevel?: { id: number; name: string } | null;
  currentLevel?: { id: number; name: string } | null;
  curriculumVersion?: { id: number; name: string } | null;
  currentEnrollmentTransition?: Record<string, unknown> | null;
};

// Paginated collection wrapper

export type PaginatedResponse<T> = {
  totalItems: number;
  member: T[];
  view: { first: string; last: string };
};

// Query parameter types

export type StudentListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  include?: string;
  'search[firstName]'?: string;
  'search[lastName]'?: string;
  'search[matricNumber]'?: string;
  'exact[status]'?: StudentStatus;
  'exact[entryMode]'?: EntryMode;
  'exact[programId]'?: number;
};

// Request bodies

export type CreateStudentRequest = {
  matricNumber: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  entryMode: EntryMode;
  programId: number;
  entryLevelId: number;
  currentLevelId: number;
  curriculumVersionId: number;
  status?: StudentStatus;
  metaData?: Record<string, unknown> | null;
};

export type UpdateStudentRequest = {
  firstName: string;
  lastName: string;
  email?: string | null;
  currentLevelId: number;
  status: StudentStatus;
  metaData?: Record<string, unknown> | null;
};

// Bulk upload types

export type UploadError = {
  row?: number;
  matricNumber: string;
  message: string;
};

export type UploadSummary = {
  processedCount: number;
  skippedCount: number;
  errors: UploadError[];
};

export type UploadSummaryState = "success" | "partial" | "failed" | "parse-error";

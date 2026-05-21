export type OlevelSubject = {
  id: number;
  name: string;
  code: string | null;
  createdAt: string;
};

export type CreateOlevelSubjectRequest = {
  name: string;
  code?: string | null;
};

export type UpdateOlevelSubjectRequest = {
  id: number;
  name: string;
  code?: string | null;
};

export type OlevelSubjectListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "search[name]"?: string;
  "exact[code]"?: string;
  "exact[id]"?: number;
};

export type PopulateOlevelSubjectsResponse = {
  created: number;
  updated: number;
  skipped: number;
};

export type PaginatedResponse<T> = {
  totalItems: number;
  member: T[];
  view?: {
    first: string;
    last: string;
    next: string | null;
  };
};

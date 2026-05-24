export type OlevelGradePoint = {
  id: number;
  grade: string;
  points: number;
  createdAt: string;
};

export type CreateOlevelGradePointRequest = {
  grade: string;
  points: number;
};

export type UpdateOlevelGradePointRequest = {
  id: number;
  grade: string;
  points: number;
};

export type OlevelGradePointListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "search[grade]"?: string;
  "exact[grade]"?: string;
  "exact[points]"?: number;
  "exact[id]"?: number;
};

export type PaginatedResponse<T> = {
  totalItems: number;
  member: T[];
  view?: {
    first: string;
    last: string;
    next?: string | null;
  };
};

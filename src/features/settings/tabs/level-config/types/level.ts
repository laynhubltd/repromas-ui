export type Level = {
  id: number;
  name: string;
  rankOrder: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LevelListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  'search[name]'?: string;
};

export type CreateLevelRequest = {
  name: string;
  rankOrder: number;
  description?: string | null;
};

export type UpdateLevelRequest = {
  name: string;
  rankOrder: number;
  description: string | null;
};

export type PaginatedResponse<T> = {
  totalItems: number;
  member: T[];
  view: { first: string; last: string };
};

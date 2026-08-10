import type { LevelCategory } from "./levelCategory";

export type Level = {
  id: number;
  name: string;
  rankOrder: number;
  description: string | null;
  categoryId: number | null;
  category?: LevelCategory;
  createdAt: string;
  updatedAt: string;
};

export type LevelListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  'search[name]'?: string;
  'exact[category]'?: number;
  include?: string;
};

export type CreateLevelRequest = {
  name: string;
  rankOrder: number;
  description?: string | null;
  categoryId?: number;
};

export type UpdateLevelRequest = {
  name: string;
  rankOrder: number;
  description: string | null;
  categoryId?: number;
};

export type PaginatedResponse<T> = {
  totalItems: number;
  member: T[];
  view: { first: string; last: string };
};

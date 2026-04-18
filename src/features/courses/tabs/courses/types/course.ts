import type { Department } from "@/features/academic-structure/types/faculty";

export type Course = {
  id: number;
  departmentId: number;
  code: string;
  title: string;
  creditUnits: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Relation object — only present when requested via include=department
  department?: Department | null;
};

export type CourseListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "search[code]"?: string;
  "search[title]"?: string;
  "exact[departmentId]"?: number;
  "boolean[isActive]"?: boolean;
  include?: string;
};

export type CreateCourseRequest = {
  departmentId: number;
  code: string;
  title: string;
  creditUnits: number;
  isActive: boolean;
};

export type UpdateCourseRequest = {
  id: number;
  departmentId: number;
  code: string;
  title: string;
  creditUnits: number;
  isActive: boolean;
};

export type PaginatedResponse<T> = {
  totalItems: number;
  member: T[];
  view?: { first: string; last: string; next?: string };
};

export type CourseUploadError = {
  row?: number;
  code: string;
  message: string;
};

export type CourseUploadSummary = {
  processedCount: number;
  skippedCount: number;
  errors: CourseUploadError[];
};

export type CourseUploadSummaryState = "success" | "partial" | "failed" | "parse-error";

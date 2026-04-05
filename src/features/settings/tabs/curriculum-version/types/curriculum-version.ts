export interface CurriculumVersion {
  id: number;
  name: string;
  isActiveForAdmission: boolean;
  createdAt: string; // ISO 8601
}

export interface CreateCurriculumVersionRequest {
  name: string;
}

export interface UpdateCurriculumVersionRequest {
  id: number;
  name: string;
}

export interface ActivateCurriculumVersionRequest {
  id: number;
}

export interface CurriculumVersionListParams {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "search[name]"?: string;
  "boolean[isActiveForAdmission]"?: boolean;
}

export interface HydraCollection<T> {
  member: T[];
  totalItems: number;
}

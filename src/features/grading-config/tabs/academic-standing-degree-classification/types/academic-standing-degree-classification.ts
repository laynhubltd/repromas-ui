export interface DegreeClassificationBandDTO {
  id?: number;
  academicStandingId: number;
  name: string; // e.g. "First Class", "Distinction"
  code: string; // e.g. "1ST", "DIST", "UPP_CR"
  minCgpa: number; // e.g. 3.50
  maxCgpa: number | null; // e.g. 4.00 or null (open ceiling)
  rankOrder: number; // e.g. 1 (highest honor), 2, 3...
  academicStanding?: {
    id: number;
    name: string;
    maxCgpa: number;
    scope: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export type DegreeClassificationBand = Required<Pick<DegreeClassificationBandDTO, "id">> &
  DegreeClassificationBandDTO;

export interface CreateDegreeClassificationRequest {
  academicStandingId: number;
  name: string;
  code: string;
  minCgpa: number;
  maxCgpa: number | null;
  rankOrder: number;
}

export interface UpdateDegreeClassificationRequest {
  id: number;
  name?: string;
  code?: string;
  minCgpa?: number;
  maxCgpa?: number | null;
  rankOrder?: number;
}

export interface DegreeClassificationListParams {
  academicStandingId?: number;
  "filters[academicStandingId]"?: number;
  "exact[academicStandingId]"?: number;
  "filters[name]"?: string;
  sort?: string;
  page?: number;
  itemsPerPage?: number;
  include?: string;
}

export interface DegreeClassificationListResponse {
  totalItems: number;
  member: DegreeClassificationBand[];
}

export interface DegreeClassificationPresetTemplate {
  key: string;
  label: string;
  scale: number;
  description: string;
  bands: Array<{
    name: string;
    code: string;
    minCgpa: number;
    maxCgpa: number | null;
    rankOrder: number;
  }>;
}

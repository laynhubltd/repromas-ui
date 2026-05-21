export type ProgramAdmissionConfig = {
  id: number;
  programId: number;
  totalCapacity: number;
  meritPercentage: number;
  catchmentPercentage: number;
  eldsPercentage: number;
  meritCutoff: string;
  catchmentCutoff: string;
  eldsCutoff: string;
  meritSeatsUsed: number;
  catchmentSeatsUsed: number;
  eldsSeatsUsed: number;
  createdAt: string;
  program?: {
    id: number;
    name: string;
    department?: {
      id: number;
      name: string;
      faculty?: {
        id: number;
        name: string;
      } | null;
    } | null;
  } | null;
};

export type ProgramAdmissionConfigListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  include?: string;
  "exact[programId]"?: number;
};

export type CreateProgramAdmissionConfigRequest = {
  programId: number;
  totalCapacity: number;
  meritPercentage: number;
  catchmentPercentage: number;
  eldsPercentage: number;
  meritCutoff: string;
  catchmentCutoff: string;
  eldsCutoff: string;
};

export type UpdateProgramAdmissionConfigRequest =
  CreateProgramAdmissionConfigRequest & { id: number };

export type PaginatedResponse<T> = {
  totalItems: number;
  member: T[];
};

export type ProgramAdmissionConfigFormValues = {
  programId: number;
  totalCapacity: number;
  meritPercentage: number;
  catchmentPercentage: number;
  eldsPercentage: number;
  meritCutoff: number;
  catchmentCutoff: number;
  eldsCutoff: number;
};

export type ComputedQuotaSeats = {
  meritAllocated: number;
  catchmentAllocated: number;
  eldsAllocated: number;
  meritAvailable: number;
  catchmentAvailable: number;
  eldsAvailable: number;
};

export type QuotaFilterValue = "ANY_FULL" | "ALL_OPEN" | "ZERO_CUTOFF";

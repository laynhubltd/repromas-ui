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
  minimumJambScore: number | null;
  minimumOlevelCredits: number;
  maxOlevelSittings: number;
  requireOlevelEnglish: boolean;
  requireOlevelMathematics: boolean;
  englishSubjectId: number | null;
  mathematicsSubjectId: number | null;
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
  "search[program.name]"?: string;
  "search[program.department.name]"?: string;
  "exact[programId]"?: number;
  "exact[totalCapacity]"?: number;
  "exact[meritPercentage]"?: number;
  "exact[catchmentPercentage]"?: number;
  "exact[eldsPercentage]"?: number;
  "exact[meritCutoff]"?: string;
  "exact[catchmentCutoff]"?: string;
  "exact[eldsCutoff]"?: string;
  "exact[meritSeatsUsed]"?: number;
  "exact[catchmentSeatsUsed]"?: number;
  "exact[eldsSeatsUsed]"?: number;
  "exact[minimumJambScore]"?: number;
  "exact[minimumOlevelCredits]"?: number;
  "exact[maxOlevelSittings]"?: number;
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
  minimumJambScore: number | null;
  minimumOlevelCredits: number;
  maxOlevelSittings: number;
  requireOlevelEnglish: boolean;
  requireOlevelMathematics: boolean;
  englishSubjectId: number | null;
  mathematicsSubjectId: number | null;
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
  minimumJambScore?: number | null;
  minimumOlevelCredits: number;
  maxOlevelSittings: number;
  requireOlevelEnglish: boolean;
  requireOlevelMathematics: boolean;
  englishSubjectId: number | null;
  mathematicsSubjectId: number | null;
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

export type ProgramAdmissionConfigListQueryState = {
  page: number;
  debouncedProgramNameSearch: string;
  debouncedDepartmentNameSearch: string;
  programFilter?: number;
};

import type {
  AdmissionCandidate,
  AdmissionScreening,
  OfferCandidateRequest,
  OfferDecision,
  SeatBucket,
} from "@/features/admission-candidate/tabs/candidate/types/admission-candidate";

export type { OfferCandidateRequest };

export type QuotaCategory = SeatBucket;
export type RecommendedDecision = OfferDecision;

export type ReasonCode =
  | "ADMIT_MERIT"
  | "ADMIT_CATCHMENT"
  | "ADMIT_ELDS"
  | "OFFER_CHANGE_OF_COURSE_MERIT"
  | "OFFER_CHANGE_OF_COURSE_CATCHMENT"
  | "OFFER_CHANGE_OF_COURSE_ELDS"
  | "FLAGS_ONLY_OPEN_MODE"
  | "NO_PROGRAM_CONFIG"
  | "ENGLISH_SUBJECT_NOT_RESOLVED"
  | "MATHEMATICS_SUBJECT_NOT_RESOLVED"
  | "INSUFFICIENT_OLEVEL_CREDITS"
  | "TOO_MANY_OLEVEL_SITTINGS"
  | "MISSING_OLEVEL_ENGLISH_CREDIT"
  | "MISSING_OLEVEL_MATHEMATICS_CREDIT"
  | "PRIOR_QUALIFICATION_INSUFFICIENT"
  | "JAMB_COMBO_MISMATCH"
  | "OLEVEL_COMBO_MISMATCH"
  | "COMBO_MATCH_AGGREGATE_BELOW_CUTOFF"
  | "NO_QUALIFYING_AGGREGATE_FOR_COMBO_MATCH"
  | "NO_DUAL_MATCH_PROGRAM"
  | "REJECTED_NO_ELIGIBLE_SEAT";

export type ProgramRef = {
  id: number;
  departmentId: number;
  name: string;
  degreeTitle: string;
  durationInYears: number;
  maxResidencyYears: number;
  department?: { id: number; name: string; code: string };
};

export type PaginatedResponse<T> = {
  member: T[];
  totalItems: number;
  view?: { first?: string; last?: string; next?: string; previous?: string };
};

export type AdmissionApplicationEmbed = {
  id: number;
  candidateId: number;
  appliedProgramId: number;
  offeredProgramId: number | null;
  applicationStatus: string;
  finalDecision: string;
  isMatriculated: boolean;
  updatedAt: string;
  candidate?: AdmissionCandidate;
  appliedProgram?: ProgramRef;
  offeredProgram?: ProgramRef | null;
  screening?: AdmissionScreening;
};

export type AdmissionRecommendedCandidate = {
  candidateId: number;
  applicationId: number;
  firstName: string;
  lastName: string;
  cycleId: number;
  appliedProgramId: number;
  aggregateScore: string;
  quotaCategory: QuotaCategory;
  recommendedDecision: RecommendedDecision;
  recommendedOfferedProgramId: number | null;
  reasonCode: ReasonCode | string;
  appliedProgram?: ProgramRef;
  recommendedOfferedProgram?: ProgramRef;
  application?: AdmissionApplicationEmbed;
};

export type RecommendedCandidateListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  include?: string;
  "exact[cycleId]"?: number;
  "exact[appliedProgramId]"?: number;
  "exact[quotaCategory]"?: QuotaCategory;
};

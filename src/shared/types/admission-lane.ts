/**
 * Shared Admission Entry-Mode & Lane Configuration Primitives
 *
 * Centralized in src/shared/types/ so features remain isolated and
 * src/shared/constants/* has zero upward imports from src/features/*.
 */

export type AdmissionEntryMode = "UTME" | "DIRECT_ENTRY" | "TRANSFER";

export type AdmissionIdentityMode = "JAMB" | "OPEN";

/**
 * The five lifecycle statuses for an admission cycle.
 * Forward: PRE_PROCESSING → APPLICATION_OPEN → SCREENING → LIST_RELEASED → CLOSED
 * Rollback: one step back with required reason.
 */
export type AdmissionCycleStatus =
  | "PRE_PROCESSING"
  | "APPLICATION_OPEN"
  | "SCREENING"
  | "LIST_RELEASED"
  | "CLOSED";

export type AdmissionCycleLaneConfig = {
  entryMode: AdmissionEntryMode;
  identityMode: AdmissionIdentityMode;
  enabled: boolean;
};

export type AdmissionCycleLaneInput = {
  entryMode: AdmissionEntryMode;
  identityMode: AdmissionIdentityMode;
  enabled?: boolean;
};

export type CandidateEntryMode = AdmissionEntryMode;

export type CandidateGender = "MALE" | "FEMALE" | "OTHER";

export type CandidateIntakeMode = "manual" | "jamb";

export type OfferDecision =
  | "ADMIT_MERIT"
  | "ADMIT_CATCHMENT"
  | "ADMIT_ELDS"
  | "OFFER_CHANGE_OF_COURSE"
  | "REJECTED";

export type SeatBucket = "MERIT" | "CATCHMENT" | "ELDS";

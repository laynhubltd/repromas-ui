import { humanizeEnumValue } from "@/shared/constants/billingDisplayLabels";

/** Human-readable labels for admission recommender / eligibility reason codes. */
export const RECOMMENDER_REASON_LABELS: Record<string, string> = {
  ADMIT_MERIT: "Qualified for merit admission",
  ADMIT_CATCHMENT: "Qualified for catchment admission",
  ADMIT_ELDS: "Qualified for ELDS admission",
  OFFER_CHANGE_OF_COURSE_MERIT: "Change of course merit",
  OFFER_CHANGE_OF_COURSE_CATCHMENT: "Change of course catchment",
  OFFER_CHANGE_OF_COURSE_ELDS: "Change of course ELDS",
  FLAGS_ONLY_OPEN_MODE: "Open mode — pending manual review",
  NO_PROGRAM_CONFIG: "No admission config for this program",
  ENGLISH_SUBJECT_NOT_RESOLVED: "English subject not set on program config",
  MATHEMATICS_SUBJECT_NOT_RESOLVED:
    "Mathematics subject not set on program config",
  INSUFFICIENT_OLEVEL_CREDITS: "Insufficient O-Level credits",
  TOO_MANY_OLEVEL_SITTINGS: "Too many O-Level sittings",
  MISSING_OLEVEL_ENGLISH_CREDIT: "Missing O-Level English credit",
  MISSING_OLEVEL_MATHEMATICS_CREDIT: "Missing O-Level Mathematics credit",
  PRIOR_QUALIFICATION_INSUFFICIENT: "Prior qualification requirements not met",
  JAMB_COMBO_MISMATCH: "JAMB subject combination mismatch",
  OLEVEL_COMBO_MISMATCH: "O-Level subject requirements not met",
  COMBO_MATCH_AGGREGATE_BELOW_CUTOFF: "Below cutoff on all matching programs",
  NO_QUALIFYING_AGGREGATE_FOR_COMBO_MATCH:
    "Subject match found but aggregate too low",
  NO_DUAL_MATCH_PROGRAM: "No alternate program matched requirements",
  REJECTED_NO_ELIGIBLE_SEAT: "No eligible seat available",
};

export function getRecommenderReasonLabel(
  reasonCode: string | null | undefined,
): string {
  if (!reasonCode) return "—";
  return RECOMMENDER_REASON_LABELS[reasonCode] ?? humanizeEnumValue(reasonCode);
}

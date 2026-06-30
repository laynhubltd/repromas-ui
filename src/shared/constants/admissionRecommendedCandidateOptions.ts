import type { OfferDecision } from "@/features/admission-candidate/tabs/candidate/types/admission-candidate";
import type { QuotaCategory } from "@/features/admission-candidate/tabs/recommendation/types/admission-recommended-candidate";
import { humanizeEnumValue } from "@/shared/constants/billingDisplayLabels";
import {
  OFFER_DECISION_OPTIONS,
  SEAT_BUCKET_OPTIONS,
} from "@/shared/constants/admissionCandidateOptions";

export const RECOMMENDATION_SORT_DEFAULT = "aggregateScore:desc";
export const RECOMMENDATION_ITEMS_PER_PAGE = 30;

export const RECOMMENDATION_LIST_INCLUDE =
  "appliedProgram,recommendedOfferedProgram,application,application.candidate,application.screening,application.candidate.state,application.candidate.lga,application.candidate.cycle";

export const RECOMMENDATION_DETAIL_INCLUDE =
  "application,application.candidate,application.candidate.state,application.candidate.lga,application.candidate.cycle,application.candidate.jambScores.subject,application.candidate.olevelSittings.grades.subject,application.appliedProgram.department,application.screening,appliedProgram.department,recommendedOfferedProgram.department";

export const QUOTA_CATEGORY_OPTIONS = SEAT_BUCKET_OPTIONS as {
  value: QuotaCategory;
  label: string;
}[];

export const RECOMMENDED_DECISION_LABELS = Object.fromEntries(
  OFFER_DECISION_OPTIONS.map((o) => [o.value, o.label]),
) as Record<OfferDecision, string>;

export function getRecommendedDecisionLabel(
  decision: string | null | undefined,
): string {
  if (!decision) return "—";
  return (
    RECOMMENDED_DECISION_LABELS[decision as OfferDecision] ??
    humanizeEnumValue(decision)
  );
}

export function getQuotaCategoryLabel(
  category: string | null | undefined,
): string {
  if (!category) return "—";
  const match = QUOTA_CATEGORY_OPTIONS.find((o) => o.value === category);
  return match?.label ?? humanizeEnumValue(category);
}

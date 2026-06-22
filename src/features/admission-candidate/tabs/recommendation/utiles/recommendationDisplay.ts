import type { RecommendedDecision } from "../types/admission-recommended-candidate";

export function recommendedDecisionTagColor(
  decision: RecommendedDecision,
): string | undefined {
  switch (decision) {
    case "ADMIT_MERIT":
    case "ADMIT_CATCHMENT":
    case "ADMIT_ELDS":
    case "OFFER_CHANGE_OF_COURSE":
      return "success";
    case "REJECTED":
      return "error";
    default:
      return undefined;
  }
}

import type { AdmissionScoringStrategy } from "../types/scoring-strategy";

export function resolveReferenceLabel(
  strategy: Pick<
    AdmissionScoringStrategy,
    "scope" | "referenceEntity" | "referenceId"
  >,
): string {
  if (strategy.scope === "GLOBAL") {
    return "Global fallback";
  }

  if (strategy.referenceEntity?.name) {
    return strategy.referenceEntity.name;
  }

  return "Unnamed reference";
}

import {
  getComponentTypeLabel,
  getLaneProfileLabel,
  LANE_SCREENING_METHODS,
} from "@/shared/constants/scoringStrategyOptions";
import type {
  AdmissionScoringStrategy,
  LaneProfile,
  ScoringComponent,
  ScoringComponentType,
  ScreeningMethod,
} from "../types/scoring-strategy";

export const UTME_LEGACY_METHODS: ScreeningMethod[] = [
  "JAMB_ONLY",
  "OLEVEL_GRADING",
  "POST_UTME_TEST",
];

export const DE_METHODS: ScreeningMethod[] = [
  "OLEVEL_ONLY",
  "POST_SCREENING_ONLY",
  "OLEVEL_POST_SCREENING",
  "PRIOR_QUAL_POST_SCREENING",
  "PRIOR_QUAL_ONLY",
];

export const MIXED_COMPONENT_METHODS: ScreeningMethod[] = [
  "OLEVEL_POST_SCREENING",
  "PRIOR_QUAL_POST_SCREENING",
];

export function isUtmeLegacyMethod(method: ScreeningMethod): boolean {
  return UTME_LEGACY_METHODS.includes(method);
}

export function isDeMethod(method: ScreeningMethod): boolean {
  return DE_METHODS.includes(method);
}

export function isMixedComponentMethod(method: ScreeningMethod): boolean {
  return MIXED_COMPONENT_METHODS.includes(method);
}

export function getAllowedMethodsForLane(
  laneProfile: LaneProfile,
): ScreeningMethod[] {
  return LANE_SCREENING_METHODS[laneProfile];
}

export function isMethodAllowedForLane(
  laneProfile: LaneProfile,
  method: ScreeningMethod,
): boolean {
  return getAllowedMethodsForLane(laneProfile).includes(method);
}

export function isJambWeightEditable(
  laneProfile: LaneProfile,
  method: ScreeningMethod,
): boolean {
  if (laneProfile === "UTME_JAMB") {
    return isUtmeLegacyMethod(method) && method !== "JAMB_ONLY";
  }
  if (laneProfile === "UTME_OPEN") {
    return method === "OLEVEL_GRADING" || method === "POST_UTME_TEST";
  }
  return false;
}

export function locksJambToZero(
  laneProfile: LaneProfile,
  method: ScreeningMethod,
): boolean {
  if (laneProfile === "DIRECT_ENTRY") {
    return true;
  }
  if (laneProfile === "UTME_JAMB") {
    return method === "JAMB_ONLY";
  }
  if (laneProfile === "UTME_OPEN") {
    return !isJambWeightEditable(laneProfile, method);
  }
  return false;
}

export function defaultRequiresJamb(
  laneProfile: LaneProfile,
  method: ScreeningMethod,
): boolean {
  if (laneProfile === "UTME_JAMB") {
    return isUtmeLegacyMethod(method);
  }
  return false;
}

export function resolveLaneProfileFromStrategy(
  strategy: Pick<AdmissionScoringStrategy, "laneProfile" | "strategy">,
): LaneProfile {
  if (strategy.laneProfile) {
    return strategy.laneProfile;
  }

  const method = strategy.strategy.screening_method;
  if (isUtmeLegacyMethod(method)) {
    return "UTME_JAMB";
  }
  return "DIRECT_ENTRY";
}

/** @deprecated Use getLaneProfileLabel with API laneProfile */
export function getLaneLabel(method: ScreeningMethod): "UTME" | "DE" {
  return isDeMethod(method) ? "DE" : "UTME";
}

export { getLaneProfileLabel };

export function requiredComponentTypes(
  method: ScreeningMethod,
): ScoringComponentType[] {
  if (method === "OLEVEL_POST_SCREENING") {
    return ["olevel", "post_screening"];
  }
  if (method === "PRIOR_QUAL_POST_SCREENING") {
    return ["prior_qualification", "post_screening"];
  }
  return [];
}

export function methodIncludesPriorQual(method: ScreeningMethod): boolean {
  return (
    method === "PRIOR_QUAL_ONLY" || method === "PRIOR_QUAL_POST_SCREENING"
  );
}

export function formatComponentsSummary(
  components: ScoringComponent[] | null | undefined,
): string {
  if (!components?.length) return "";
  return components
    .map(
      (component) =>
        `${getComponentTypeLabel(component.type)} ${component.weight_percentage}%`,
    )
    .join(" · ");
}

export function getMaxSchoolScoreLabel(method: ScreeningMethod): string {
  switch (method) {
    case "OLEVEL_ONLY":
    case "OLEVEL_GRADING":
      return "Max O-Level scale";
    case "POST_SCREENING_ONLY":
      return "Max post-screening score";
    case "PRIOR_QUAL_ONLY":
      return "Max prior qualification scale";
    case "OLEVEL_POST_SCREENING":
    case "PRIOR_QUAL_POST_SCREENING":
      return "Max school score cap";
    default:
      return "Max School Score";
  }
}

export function getMaxSchoolScorePlaceholder(method: ScreeningMethod): string {
  switch (method) {
    case "OLEVEL_ONLY":
    case "OLEVEL_GRADING":
      return "30";
    case "POST_SCREENING_ONLY":
    case "PRIOR_QUAL_ONLY":
    case "OLEVEL_POST_SCREENING":
    case "PRIOR_QUAL_POST_SCREENING":
      return "100";
    default:
      return "100";
  }
}

/** Form helper copy — explains how max_school_score is used at scoring time. */
export function getMaxSchoolScoreExtra(
  method: ScreeningMethod | undefined,
  maxSchoolScore?: number,
): string | undefined {
  if (!method) return undefined;

  if (method === "OLEVEL_ONLY") {
    const max = maxSchoolScore && maxSchoolScore > 0 ? maxSchoolScore : 30;
    const examplePoints = 24;
    const exampleScore = Math.round((examplePoints / max) * 100);
    return (
      `Cap for normalizing O'Level grade points on the school side (100% weight). ` +
      `Example: candidate totals ${examplePoints} points on the best sitting → ` +
      `(${examplePoints} ÷ ${max}) × 100 = ${exampleScore} school score.`
    );
  }

  if (method === "OLEVEL_GRADING") {
    return (
      "Maximum grade-point total on the O'Level scale used to normalize the school portion."
    );
  }

  if (method === "POST_SCREENING_ONLY") {
    return "Maximum raw score for the post-screening exam (often 100).";
  }

  if (method === "PRIOR_QUAL_ONLY") {
    return "Maximum scale for prior qualification scoring when implemented.";
  }

  if (method === "OLEVEL_POST_SCREENING" || method === "PRIOR_QUAL_POST_SCREENING") {
    return "Upper cap shared by mixed school-side components when normalizing scores.";
  }

  return undefined;
}

export function isDeSingleComponentMethod(method: ScreeningMethod): boolean {
  return isDeMethod(method) && !isMixedComponentMethod(method);
}

export function isSchoolOnlyMethod(
  laneProfile: LaneProfile,
  method: ScreeningMethod,
): boolean {
  if (laneProfile === "DIRECT_ENTRY") {
    return isDeMethod(method);
  }
  if (laneProfile === "UTME_OPEN") {
    return locksJambToZero(laneProfile, method);
  }
  return false;
}

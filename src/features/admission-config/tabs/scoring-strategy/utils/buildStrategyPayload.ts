import type {
  LaneProfile,
  ScoringStrategyFormValues,
  StrategyPayload,
} from "../types/scoring-strategy";
import {
  defaultRequiresJamb,
  isMixedComponentMethod,
  locksJambToZero,
} from "./scoringStrategyDisplay";

function resolveLockedStrategyFields(
  laneProfile: LaneProfile,
  values: Pick<
    ScoringStrategyFormValues,
    | "screening_method"
    | "jamb_weight_percentage"
    | "school_weight_percentage"
    | "max_jamb_score"
  >,
): Pick<
  StrategyPayload,
  "jamb_weight_percentage" | "school_weight_percentage" | "max_jamb_score"
> {
  const method = values.screening_method;

  if (method === "JAMB_ONLY") {
    return {
      jamb_weight_percentage: 100,
      school_weight_percentage: 0,
      max_jamb_score: values.max_jamb_score ?? 400,
    };
  }

  if (locksJambToZero(laneProfile, method)) {
    return {
      jamb_weight_percentage: 0,
      school_weight_percentage: 100,
      max_jamb_score: 0,
    };
  }

  return {
    jamb_weight_percentage: values.jamb_weight_percentage,
    school_weight_percentage: values.school_weight_percentage,
    max_jamb_score: values.max_jamb_score,
  };
}

export function buildStrategyPayload(
  laneProfile: LaneProfile,
  values: Pick<
    ScoringStrategyFormValues,
    | "screening_method"
    | "jamb_weight_percentage"
    | "school_weight_percentage"
    | "max_jamb_score"
    | "max_school_score"
    | "requires_jamb"
    | "components"
  >,
): StrategyPayload {
  const requires_jamb =
    values.requires_jamb ??
    defaultRequiresJamb(laneProfile, values.screening_method);
  const lockedFields = resolveLockedStrategyFields(laneProfile, values);

  const payload: StrategyPayload = {
    screening_method: values.screening_method,
    ...lockedFields,
    max_school_score: values.max_school_score,
    requires_jamb,
  };

  if (isMixedComponentMethod(values.screening_method) && values.components) {
    payload.components = values.components;
  }

  return payload;
}

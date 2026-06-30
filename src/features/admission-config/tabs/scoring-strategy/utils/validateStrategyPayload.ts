import type { LaneProfile, StrategyPayload } from "../types/scoring-strategy";
import {
  getAllowedMethodsForLane,
  isMixedComponentMethod,
  isUtmeLegacyMethod,
  requiredComponentTypes,
} from "./scoringStrategyDisplay";

export type StrategyValidationResult = {
  valid: boolean;
  message?: string;
};

export function validateStrategyPayload(
  laneProfile: LaneProfile,
  payload: StrategyPayload,
): StrategyValidationResult {
  const {
    screening_method,
    jamb_weight_percentage,
    school_weight_percentage,
    max_jamb_score,
    max_school_score,
    requires_jamb,
    components,
  } = payload;

  if (!getAllowedMethodsForLane(laneProfile).includes(screening_method)) {
    return {
      valid: false,
      message: `Screening method ${screening_method} is not allowed for this lane`,
    };
  }

  const weightsSum = jamb_weight_percentage + school_weight_percentage;
  if (weightsSum !== 100) {
    return { valid: false, message: "Weights must sum to 100%" };
  }

  if (max_school_score <= 0) {
    return { valid: false, message: "Max school score must be greater than 0" };
  }

  if (screening_method === "JAMB_ONLY") {
    if (jamb_weight_percentage !== 100 || school_weight_percentage !== 0) {
      return {
        valid: false,
        message: "JAMB Only requires 100% JAMB and 0% school",
      };
    }
  }

  if (laneProfile === "UTME_JAMB") {
    if (requires_jamb === false) {
      return {
        valid: false,
        message: "UTME (JAMB) lane requires JAMB for scoring",
      };
    }
    if (isUtmeLegacyMethod(screening_method) && max_jamb_score <= 0) {
      return {
        valid: false,
        message: "Max JAMB score must be greater than 0",
      };
    }
  }

  if (laneProfile === "UTME_OPEN") {
    if (
      requires_jamb === true &&
      jamb_weight_percentage > 0 &&
      max_jamb_score <= 0
    ) {
      return {
        valid: false,
        message: "Max JAMB score must be greater than 0 when JAMB is weighted",
      };
    }
  }

  if (laneProfile === "DIRECT_ENTRY") {
    if (requires_jamb === true) {
      return {
        valid: false,
        message: "Direct Entry methods cannot require JAMB",
      };
    }
    if (jamb_weight_percentage !== 0) {
      return {
        valid: false,
        message: "Direct Entry methods require 0% JAMB weight",
      };
    }
    if (school_weight_percentage !== 100) {
      return {
        valid: false,
        message: "Direct Entry methods require 100% school weight",
      };
    }
    if (max_jamb_score !== 0) {
      return {
        valid: false,
        message: "Direct Entry methods require max JAMB score of 0",
      };
    }
  }

  if (isMixedComponentMethod(screening_method)) {
    if (!components?.length) {
      return {
        valid: false,
        message: "Mixed methods require component weights",
      };
    }

    const expectedTypes = requiredComponentTypes(screening_method);
    const actualTypes = components.map((component) => component.type);
    const hasDuplicates = new Set(actualTypes).size !== actualTypes.length;
    if (hasDuplicates) {
      return {
        valid: false,
        message: "Component types must not be duplicated",
      };
    }

    const missingType = expectedTypes.find(
      (type) => !actualTypes.includes(type),
    );
    if (missingType || actualTypes.length !== expectedTypes.length) {
      return {
        valid: false,
        message: "Mixed methods require the exact component types for the method",
      };
    }

    const componentSum = components.reduce(
      (sum, component) => sum + component.weight_percentage,
      0,
    );
    if (componentSum !== 100) {
      return {
        valid: false,
        message: "Component weights must sum to 100%",
      };
    }
  } else if (components !== undefined && components !== null) {
    return {
      valid: false,
      message: "Components must be omitted for single-component methods",
    };
  }

  return { valid: true };
}

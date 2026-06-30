import { DEFAULT_SCALE_BY_FORMAT } from "@/shared/constants/priorQualificationTypeOptions";
import type {
  AssessmentFormat,
  CreatePriorQualificationTypeRequest,
  PriorQualificationType,
  QualificationTypeFormValues,
  ScaleDefinition,
  UpdatePriorQualificationTypeRequest,
} from "../types/prior-qualification-type";
import { normalizeQualificationTypeCode } from "./normalizeQualificationTypeCode";
import { validateScaleDefinition } from "./validateScaleDefinition";

export function buildScaleDefinitionFromFormValues(
  values: QualificationTypeFormValues,
): ScaleDefinition {
  switch (values.assessmentFormat) {
    case "POINTS":
      return { maxPoints: values.maxPoints ?? 0 };
    case "CLASSIFICATION": {
      const items = (values.classificationItems ?? [])
        .map((item) => item.trim())
        .filter(Boolean);
      const key = values.classificationKey ?? "classes";
      return { [key]: items };
    }
    case "CGPA":
      return {
        min: values.cgpaMin ?? 0,
        max: values.cgpaMax ?? 0,
      };
    case "PASS_FAIL":
      return { values: ["PASS", "FAIL"] };
    default: {
      const _exhaustive: never = values.assessmentFormat;
      return _exhaustive;
    }
  }
}

export function formValuesFromQualificationType(
  target: PriorQualificationType,
): QualificationTypeFormValues {
  const scale = target.scaleDefinition;
  const base: QualificationTypeFormValues = {
    code: target.code,
    name: target.name,
    assessmentFormat: target.assessmentFormat,
    scaleDefinition: scale,
    isActive: target.isActive,
  };

  switch (target.assessmentFormat) {
    case "POINTS":
      return {
        ...base,
        maxPoints: (scale as { maxPoints?: number }).maxPoints,
      };
    case "CLASSIFICATION": {
      const classes = (scale as { classes?: string[] }).classes;
      const grades = (scale as { grades?: string[] }).grades;
      if (grades?.length) {
        return {
          ...base,
          classificationKey: "grades",
          classificationItems: [...grades],
        };
      }
      return {
        ...base,
        classificationKey: "classes",
        classificationItems: classes ? [...classes] : [],
      };
    }
    case "CGPA":
      return {
        ...base,
        cgpaMin: (scale as { min?: number }).min,
        cgpaMax: (scale as { max?: number }).max,
      };
    case "PASS_FAIL":
      return base;
    default: {
      const _exhaustive: never = target.assessmentFormat;
      return _exhaustive;
    }
  }
}

export function defaultFormValuesForFormat(
  format: AssessmentFormat,
): Partial<QualificationTypeFormValues> {
  const scale = DEFAULT_SCALE_BY_FORMAT[format];
  const values: Partial<QualificationTypeFormValues> = {
    assessmentFormat: format,
    scaleDefinition: scale,
  };

  switch (format) {
    case "POINTS":
      values.maxPoints = (scale as { maxPoints: number }).maxPoints;
      break;
    case "CLASSIFICATION": {
      const classes = (scale as { classes?: string[] }).classes;
      const grades = (scale as { grades?: string[] }).grades;
      if (grades?.length) {
        values.classificationKey = "grades";
        values.classificationItems = [...grades];
      } else {
        values.classificationKey = "classes";
        values.classificationItems = classes ? [...classes] : [];
      }
      break;
    }
    case "CGPA":
      values.cgpaMin = (scale as { min: number }).min;
      values.cgpaMax = (scale as { max: number }).max;
      break;
    case "PASS_FAIL":
      break;
    default: {
      const _exhaustive: never = format;
      return _exhaustive;
    }
  }

  return values;
}

export function buildCreateQualificationTypePayload(
  values: QualificationTypeFormValues,
): CreatePriorQualificationTypeRequest {
  const scaleDefinition = buildScaleDefinitionFromFormValues(values);
  const validation = validateScaleDefinition(values.assessmentFormat, scaleDefinition);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  return {
    code: normalizeQualificationTypeCode(values.code),
    name: values.name.trim(),
    assessmentFormat: values.assessmentFormat,
    scaleDefinition: validation.scaleDefinition,
    isActive: values.isActive ?? true,
  };
}

export function buildUpdateQualificationTypePayload(
  values: QualificationTypeFormValues,
  target: PriorQualificationType,
): UpdatePriorQualificationTypeRequest {
  const scaleDefinition = buildScaleDefinitionFromFormValues(values);
  const validation = validateScaleDefinition(values.assessmentFormat, scaleDefinition);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  return {
    code: normalizeQualificationTypeCode(target.code),
    name: values.name.trim(),
    assessmentFormat: values.assessmentFormat,
    scaleDefinition: validation.scaleDefinition,
    isActive: values.isActive,
  };
}

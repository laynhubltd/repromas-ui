import type { Rule } from "antd/es/form";
import type { ProgramAdmissionConfigFormValues } from "../types/program-admission-config";

export const programIdRules: Rule[] = [
  { required: true, message: "Program is required" },
];

export const totalCapacityRules: Rule[] = [
  { required: true, message: "Total capacity is required" },
  { type: "number", min: 1, message: "Total capacity must be greater than 0" },
];

export const quotaPercentageRules: Rule[] = [
  { required: true, message: "Percentage is required" },
  { type: "number", min: 0, max: 100, message: "Percentage must be 0 to 100" },
];

export const cutoffRules: Rule[] = [
  { required: true, message: "Cut-off is required" },
  { type: "number", min: 0, max: 100, message: "Cut-off must be 0 to 100" },
];

export function validateQuotaTotals(values: ProgramAdmissionConfigFormValues): string | null {
  const total =
    values.meritPercentage + values.catchmentPercentage + values.eldsPercentage;
  if (total !== 100) {
    return "Merit, catchment, and ELDS percentages must sum to 100.";
  }
  return null;
}

export function validateCutoffOrdering(
  values: ProgramAdmissionConfigFormValues,
): string | null {
  if (values.meritCutoff < values.catchmentCutoff) {
    return "Merit cut-off must be greater than or equal to catchment cut-off.";
  }
  if (values.catchmentCutoff < values.eldsCutoff) {
    return "Catchment cut-off must be greater than or equal to ELDS cut-off.";
  }
  return null;
}

import type { CalculationMethod } from "@/features/courses/tabs/course-assessment-policy/types/course-assessment-policy";
import { humanizeEnumValue } from "@/shared/constants/billingDisplayLabels";

export const CALCULATION_METHOD_LABELS: Record<CalculationMethod, string> = {
  WEIGHTED_SUM: "Weighted Sum",
  AVERAGE: "Average",
  BEST_OF: "Best Of",
};

export function getCalculationMethodLabel(
  method: string | null | undefined,
): string {
  if (!method) return "—";
  return (
    CALCULATION_METHOD_LABELS[method as CalculationMethod] ??
    humanizeEnumValue(method)
  );
}

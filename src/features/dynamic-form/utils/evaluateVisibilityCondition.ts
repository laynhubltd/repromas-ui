import type { VisibilityCondition } from "../types";

export function evaluateVisibilityCondition(
  condition: VisibilityCondition | undefined,
  sectionValues: Record<string, unknown>,
): boolean {
  if (!condition) return true;

  const actual = sectionValues[condition.field];

  switch (condition.operator) {
    case "equals":
      return actual === condition.value;
    case "not_equals":
      return actual !== condition.value;
    case "in":
      return (
        Array.isArray(condition.value) &&
        condition.value.includes(actual as never)
      );
    default:
      return true;
  }
}

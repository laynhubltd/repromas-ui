// Feature: settings-timeframe
import type { Department, Faculty, Program } from "@/features/academic-structure/types/faculty";
import type { Level } from "@/features/settings/tabs/level-config/types/level";
import type { Student } from "@/features/student/types/student";
import type { Scope, ScopeReference } from "../types/system-timeframe";

export function resolveScopeReferenceLabel(
  scope: Scope,
  referenceId: number | null,
  scopeReference: ScopeReference | null | undefined,
): string {
  if (!referenceId) return "All";
  if (!scopeReference) return `#${referenceId}`;

  switch (scope) {
    case "STUDENT":
      return (scopeReference as Student).matricNumber;
    case "FACULTY":
      return (scopeReference as Faculty).code;
    case "DEPARTMENT":
      return (scopeReference as Department).code;
    case "PROGRAM":
      return (scopeReference as Program).name;
    case "LEVEL":
      return (scopeReference as Level).name;
    default:
      return "All";
  }
}

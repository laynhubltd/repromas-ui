import type { JambScopeValue } from "../types/jamb-rule";

type NamedEntity = { id: number; name: string };

export function resolveReferenceLabel(
  scope: JambScopeValue,
  referenceId: number | null,
  faculties: NamedEntity[],
  departments: NamedEntity[],
  programs: NamedEntity[],
): string {
  if (scope === "GLOBAL") return "Institution default";
  if (referenceId == null) return "—";

  const lookup = (list: NamedEntity[]) =>
    list.find((item) => item.id === referenceId)?.name ?? "Unnamed reference";

  switch (scope) {
    case "FACULTY":
      return lookup(faculties);
    case "DEPARTMENT":
      return lookup(departments);
    case "PROGRAM":
      return lookup(programs);
    default:
      return "Unnamed reference";
  }
}

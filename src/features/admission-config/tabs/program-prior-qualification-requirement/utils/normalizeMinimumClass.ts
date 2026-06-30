export function normalizeMinimumClass(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.toUpperCase() : null;
}

export function normalizeRequirementGroup(
  groupMode: "standalone" | "or",
  requirementGroup: string | null | undefined,
): string | null {
  if (groupMode === "standalone") return null;
  const trimmed = requirementGroup?.trim();
  return trimmed ? trimmed : null;
}

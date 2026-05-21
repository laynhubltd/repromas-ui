import type {
  ProgramOlevelRequirement,
  ProgramOlevelRuleGroup,
} from "../types/program-olevel-rule";

export function groupRequirementsByProgram(
  rows: ProgramOlevelRequirement[],
): ProgramOlevelRuleGroup[] {
  const byProgram = new Map<number, ProgramOlevelRequirement[]>();

  for (const row of rows) {
    const existing = byProgram.get(row.programId) ?? [];
    existing.push(row);
    byProgram.set(row.programId, existing);
  }

  const groups: ProgramOlevelRuleGroup[] = [];

  for (const [programId, requirements] of byProgram) {
    const sorted = [...requirements].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const first = sorted[0];
    const program = first.program;
    const department = program?.department ?? null;
    const faculty = department?.faculty ?? null;

    const latestCreatedAt = sorted.reduce<string | null>((latest, r) => {
      if (!latest) return r.createdAt;
      return new Date(r.createdAt) > new Date(latest) ? r.createdAt : latest;
    }, null);

    const compulsoryRequirements = sorted.filter((r) => r.isCompulsory);
    const optionalRequirements = sorted.filter((r) => !r.isCompulsory);

    groups.push({
      programId,
      programName: program?.name ?? `Program #${programId}`,
      departmentName: department?.name ?? null,
      facultyName: faculty?.name ?? null,
      departmentId: department?.id ?? program?.departmentId ?? null,
      facultyId: faculty?.id ?? department?.facultyId ?? null,
      requirements: sorted,
      compulsoryRequirements,
      optionalRequirements,
      subjectCount: sorted.length,
      compulsoryCount: compulsoryRequirements.length,
      optionalCount: optionalRequirements.length,
      latestCreatedAt,
    });
  }

  return groups.sort((a, b) =>
    a.programName.localeCompare(b.programName, undefined, {
      sensitivity: "base",
    }),
  );
}

export function filterRuleGroups(
  groups: ProgramOlevelRuleGroup[],
  options: {
    search: string;
    facultyId?: number;
    departmentId?: number;
  },
): ProgramOlevelRuleGroup[] {
  const q = options.search.trim().toLowerCase();

  return groups.filter((g) => {
    if (options.facultyId !== undefined && g.facultyId !== options.facultyId) {
      return false;
    }
    if (
      options.departmentId !== undefined &&
      g.departmentId !== options.departmentId
    ) {
      return false;
    }
    if (!q) return true;

    const haystack = [
      g.programName,
      g.departmentName ?? "",
      g.facultyName ?? "",
      ...g.requirements.map((r) => r.subject?.name ?? ""),
      ...g.requirements.map((r) => r.subject?.code ?? ""),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}

export function programsMissingOlevelRules(
  programs: { id: number; name: string }[],
  configuredProgramIds: Set<number>,
): { id: number; name: string }[] {
  return programs.filter((p) => !configuredProgramIds.has(p.id));
}

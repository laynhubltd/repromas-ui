import type {
  ProgramPriorQualOrGroup,
  ProgramPriorQualificationRequirement,
  ProgramPriorQualRequirementGroup,
} from "../types/program-prior-qualification-requirement";

function splitOrAndRequirements(
  requirements: ProgramPriorQualificationRequirement[],
): {
  orGroups: ProgramPriorQualOrGroup[];
  andRequirements: ProgramPriorQualificationRequirement[];
} {
  const andRequirements = requirements.filter((row) => !row.requirementGroup);
  const orMap = new Map<string, ProgramPriorQualificationRequirement[]>();

  for (const row of requirements) {
    if (!row.requirementGroup) continue;
    const existing = orMap.get(row.requirementGroup) ?? [];
    existing.push(row);
    orMap.set(row.requirementGroup, existing);
  }

  const orGroups = [...orMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, groupRequirements]) => ({
      key,
      requirements: [...groupRequirements].sort((a, b) =>
        (a.priorQualificationType?.code ?? "").localeCompare(
          b.priorQualificationType?.code ?? "",
        ),
      ),
    }));

  andRequirements.sort((a, b) =>
    (a.priorQualificationType?.code ?? "").localeCompare(
      b.priorQualificationType?.code ?? "",
    ),
  );

  return { orGroups, andRequirements };
}

export function groupRequirementsByProgram(
  rows: ProgramPriorQualificationRequirement[],
): ProgramPriorQualRequirementGroup[] {
  const byProgram = new Map<number, ProgramPriorQualificationRequirement[]>();

  for (const row of rows) {
    const existing = byProgram.get(row.programId) ?? [];
    existing.push(row);
    byProgram.set(row.programId, existing);
  }

  const groups: ProgramPriorQualRequirementGroup[] = [];

  for (const [programId, requirements] of byProgram) {
    const sorted = [...requirements].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const first = sorted[0];
    const program = first.program;
    const department = program?.department ?? null;
    const faculty = department?.faculty ?? null;
    const { orGroups, andRequirements } = splitOrAndRequirements(sorted);

    const latestCreatedAt = sorted.reduce<string | null>((latest, row) => {
      if (!latest) return row.createdAt;
      return new Date(row.createdAt) > new Date(latest) ? row.createdAt : latest;
    }, null);

    groups.push({
      programId,
      programName: program?.name ?? `Program #${programId}`,
      departmentName: department?.name ?? null,
      facultyName: faculty?.name ?? null,
      departmentId: department?.id ?? program?.departmentId ?? null,
      facultyId: faculty?.id ?? department?.facultyId ?? null,
      orGroups,
      andRequirements,
      requirementCount: sorted.length,
      latestCreatedAt,
    });
  }

  return groups.sort((a, b) =>
    a.programName.localeCompare(b.programName, undefined, { sensitivity: "base" }),
  );
}

export function filterRequirementGroups(
  groups: ProgramPriorQualRequirementGroup[],
  options: {
    search: string;
    facultyId?: number;
    departmentId?: number;
    programId?: number;
    isMandatory?: boolean;
  },
): ProgramPriorQualRequirementGroup[] {
  const q = options.search.trim().toLowerCase();

  return groups
    .map((group) => {
      const allRequirements = [
        ...group.andRequirements,
        ...group.orGroups.flatMap((orGroup) => orGroup.requirements),
      ];

      const filteredRequirements = allRequirements.filter((row) => {
        if (options.isMandatory !== undefined && row.isMandatory !== options.isMandatory) {
          return false;
        }
        return true;
      });

      if (filteredRequirements.length === 0) return null;

      const { orGroups, andRequirements } = splitOrAndRequirements(filteredRequirements);

      return {
        ...group,
        orGroups,
        andRequirements,
        requirementCount: filteredRequirements.length,
      };
    })
    .filter((group): group is ProgramPriorQualRequirementGroup => {
      if (!group) return false;

      if (options.facultyId !== undefined && group.facultyId !== options.facultyId) {
        return false;
      }
      if (
        options.departmentId !== undefined &&
        group.departmentId !== options.departmentId
      ) {
        return false;
      }
      if (options.programId !== undefined && group.programId !== options.programId) {
        return false;
      }

      if (!q) return true;

      const haystack = [
        group.programName,
        group.departmentName ?? "",
        group.facultyName ?? "",
        ...group.andRequirements.map((row) => row.priorQualificationType?.code ?? ""),
        ...group.andRequirements.map((row) => row.priorQualificationType?.name ?? ""),
        ...group.orGroups.flatMap((orGroup) =>
          orGroup.requirements.map((row) => row.priorQualificationType?.code ?? ""),
        ),
        ...group.orGroups.flatMap((orGroup) =>
          orGroup.requirements.map((row) => row.priorQualificationType?.name ?? ""),
        ),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
}

export function programsMissingPriorQualRequirements(
  programs: { id: number; name: string }[],
  configuredProgramIds: Set<number>,
): { id: number; name: string }[] {
  return programs.filter((program) => !configuredProgramIds.has(program.id));
}

export function getTypeIdsForProgram(
  groups: ProgramPriorQualRequirementGroup[],
  programId: number,
): number[] {
  const group = groups.find((item) => item.programId === programId);
  if (!group) return [];

  return [
    ...group.andRequirements.map((row) => row.priorQualificationTypeId),
    ...group.orGroups.flatMap((orGroup) =>
      orGroup.requirements.map((row) => row.priorQualificationTypeId),
    ),
  ];
}

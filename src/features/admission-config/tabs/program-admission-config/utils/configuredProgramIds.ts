import type { ProgramAdmissionConfig } from "../types/program-admission-config";

export function resolveProgramId(value: unknown): number | null {
  if (value == null) return null;
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

export function extractConfiguredProgramIds(
  configs: ProgramAdmissionConfig[],
): Set<number> {
  const ids = new Set<number>();
  for (const config of configs) {
    const id = resolveProgramId(config.programId ?? config.program?.id);
    if (id !== null) ids.add(id);
  }
  return ids;
}

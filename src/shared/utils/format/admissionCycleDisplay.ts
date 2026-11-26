import {
  entryModeLabelByValue,
  ADMISSION_CYCLE_ENTRY_MODE_OPTIONS,
  statusLabelByValue,
} from "@/shared/constants/admissionCycleOptions";
import type {
  AdmissionCycleLaneConfig,
  AdmissionCycleStatus,
  AdmissionEntryMode,
  AdmissionIdentityMode,
} from "@/shared/types/admission-lane";

type CycleBatchShape = {
  sessionId: number;
  batchNo: number;
};

type CycleOptionShape = {
  name: string;
  status: AdmissionCycleStatus;
  entryModes?: AdmissionCycleLaneConfig[];
  batchNo: number;
};

const STATUS_ORDER: AdmissionCycleStatus[] = [
  "PRE_PROCESSING",
  "APPLICATION_OPEN",
  "SCREENING",
  "LIST_RELEASED",
  "CLOSED",
];

/** Allowed identity modes per entry mode (TRANSFER permits OPEN only). */
export function getAllowedIdentityModes(
  entryMode: AdmissionEntryMode,
): AdmissionIdentityMode[] {
  return entryMode === "TRANSFER" ? ["OPEN"] : ["JAMB", "OPEN"];
}

/** Finds the configured lane on a cycle for a given entryMode. */
export function getCycleLane(
  cycle: { entryModes?: AdmissionCycleLaneConfig[] },
  entryMode: AdmissionEntryMode,
): AdmissionCycleLaneConfig | undefined {
  return cycle.entryModes?.find((l) => l.entryMode === entryMode);
}

/** Session + batch slot uniqueness key ("sessionId:batchNo"). */
export function buildBatchSlotKey(sessionId: number, batchNo: number): string {
  return `${sessionId}:${batchNo}`;
}

/** Human-readable entry mode + batch for single-lane candidate portals, e.g. "UTME, Batch 2". */
export function formatEntryBatchLabel(
  entryMode: AdmissionEntryMode,
  batchNo: number,
): string {
  const modeLabel = entryModeLabelByValue[entryMode] ?? entryMode;
  return `${modeLabel}, Batch ${batchNo}`;
}

/** @deprecated Use formatEntryBatchLabel */
export const formatLaneLabel = formatEntryBatchLabel;

/** Formats configured cycle lanes cleanly (including paused lanes). */
export function formatCycleLanesSummary(
  entryModes: AdmissionCycleLaneConfig[] | undefined,
): string {
  if (!entryModes || entryModes.length === 0) return "No entry modes";
  return entryModes
    .map((l) => {
      const short =
        ADMISSION_CYCLE_ENTRY_MODE_OPTIONS.find((o) => o.value === l.entryMode)
          ?.shortLabel ?? l.entryMode;
      return l.enabled ? short : `${short} (paused)`;
    })
    .join(" · ");
}

/** Formats multi-lane cycle summary + batch, e.g. "UTME · DE (paused), Batch 1". */
export function formatCycleBatchLabel(
  entryModes: AdmissionCycleLaneConfig[] | undefined,
  batchNo: number,
): string {
  return `${formatCycleLanesSummary(entryModes)}, Batch ${batchNo}`;
}

export function getOccupiedBatchSlots(
  cycles: CycleBatchShape[],
): Set<string> {
  const slots = new Set<string>();
  for (const cycle of cycles) {
    slots.add(buildBatchSlotKey(cycle.sessionId, cycle.batchNo));
  }
  return slots;
}

export function getCyclesInSession<T extends { sessionId: number }>(
  cycles: T[],
  sessionId: number,
): T[] {
  return cycles.filter((c) => c.sessionId === sessionId);
}

export function suggestNextBatchNo(
  cycles: CycleBatchShape[],
  sessionId: number,
): number {
  const inSession = getCyclesInSession(cycles, sessionId);
  if (inSession.length === 0) return 1;
  const maxBatch = Math.max(...inSession.map((c) => c.batchNo));
  return maxBatch + 1;
}

export function isBatchSlotOccupied(
  cycles: CycleBatchShape[],
  sessionId: number,
  batchNo: number,
): boolean {
  return getOccupiedBatchSlots(cycles).has(
    buildBatchSlotKey(sessionId, batchNo),
  );
}

export function isRollbackTransition(
  current: AdmissionCycleStatus,
  requested: AdmissionCycleStatus,
): boolean {
  const currentIdx = STATUS_ORDER.indexOf(current);
  const requestedIdx = STATUS_ORDER.indexOf(requested);
  return requestedIdx === currentIdx - 1;
}

export function formatCycleOptionLabel(cycle: CycleOptionShape): string {
  const batchLabel = formatCycleBatchLabel(cycle.entryModes, cycle.batchNo);
  const status = statusLabelByValue[cycle.status] ?? cycle.status;
  return `${cycle.name} (${batchLabel} · ${status})`;
}

export function buildDefaultCycleName(
  sessionName: string,
  batchNo: number,
): string {
  const base = `${sessionName} Admission`;
  return batchNo > 1 ? `${base} — Batch ${batchNo}` : base;
}

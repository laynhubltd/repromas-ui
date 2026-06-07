import {
  entryModeLabelByValue,
  statusLabelByValue,
} from "@/shared/constants/admissionCycleOptions";
import type {
  AdmissionCycle,
  AdmissionCycleStatus,
  AdmissionEntryMode,
} from "../types/admission-cycle";

export function buildLaneSlotKey(
  sessionId: number,
  entryMode: AdmissionEntryMode,
  batchNo: number,
): string {
  return `${sessionId}:${entryMode}:${batchNo}`;
}

/** Human-readable entry mode + batch, e.g. "UTME, Batch 2". */
export function formatEntryBatchLabel(
  entryMode: AdmissionEntryMode,
  batchNo: number,
): string {
  const modeLabel = entryModeLabelByValue[entryMode] ?? entryMode;
  return `${modeLabel}, Batch ${batchNo}`;
}

/** @deprecated Use formatEntryBatchLabel */
export const formatLaneLabel = formatEntryBatchLabel;

export function getOccupiedLaneSlots(cycles: AdmissionCycle[]): Set<string> {
  const slots = new Set<string>();
  for (const cycle of cycles) {
    slots.add(
      buildLaneSlotKey(cycle.sessionId, cycle.entryMode, cycle.batchNo),
    );
  }
  return slots;
}

export function getCyclesInLane(
  cycles: AdmissionCycle[],
  sessionId: number,
  entryMode: AdmissionEntryMode,
): AdmissionCycle[] {
  return cycles.filter(
    (c) => c.sessionId === sessionId && c.entryMode === entryMode,
  );
}

export function suggestNextBatchNo(
  cycles: AdmissionCycle[],
  sessionId: number,
  entryMode: AdmissionEntryMode,
): number {
  const inLane = getCyclesInLane(cycles, sessionId, entryMode);
  if (inLane.length === 0) return 1;
  const maxBatch = Math.max(...inLane.map((c) => c.batchNo));
  return maxBatch + 1;
}

export function isLaneSlotOccupied(
  cycles: AdmissionCycle[],
  sessionId: number,
  entryMode: AdmissionEntryMode,
  batchNo: number,
): boolean {
  return getOccupiedLaneSlots(cycles).has(
    buildLaneSlotKey(sessionId, entryMode, batchNo),
  );
}

const STATUS_ORDER: AdmissionCycleStatus[] = [
  "PRE_PROCESSING",
  "APPLICATION_OPEN",
  "SCREENING",
  "LIST_RELEASED",
  "CLOSED",
];

export function isRollbackTransition(
  current: AdmissionCycleStatus,
  requested: AdmissionCycleStatus,
): boolean {
  const currentIdx = STATUS_ORDER.indexOf(current);
  const requestedIdx = STATUS_ORDER.indexOf(requested);
  return requestedIdx === currentIdx - 1;
}

export function formatCycleOptionLabel(cycle: AdmissionCycle): string {
  const entryBatch = formatEntryBatchLabel(cycle.entryMode, cycle.batchNo);
  const status = statusLabelByValue[cycle.status] ?? cycle.status;
  return `${cycle.name} (${entryBatch} · ${status})`;
}

export function buildDefaultCycleName(
  sessionName: string,
  entryMode: AdmissionEntryMode,
  batchNo: number,
): string {
  const modeLabel = entryModeLabelByValue[entryMode] ?? entryMode;
  const base = `${sessionName} ${modeLabel} Admission`;
  return batchNo > 1 ? `${base} — Batch ${batchNo}` : base;
}

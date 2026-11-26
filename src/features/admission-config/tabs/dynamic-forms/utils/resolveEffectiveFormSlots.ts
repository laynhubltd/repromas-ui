import type { AdmissionCycleLaneConfig } from "@/features/admission-config/tabs/admission-cycle/types/admission-cycle";
import type {
  FormAssignment,
  FormTemplate,
} from "@/features/dynamic-form/types";
import { getCandidateEntryModeLabel } from "@/shared/constants/admissionCandidateOptions";
import type { AdmissionEntryMode } from "@/shared/types/admission-lane";

export const GLOBAL_SLOT_ORDER: Array<AdmissionEntryMode | null> = [
  null,
  "UTME",
  "DIRECT_ENTRY",
  "TRANSFER",
];

export type GlobalFormSlot = {
  entryMode: AdmissionEntryMode | null;
  slotLabel: string;
  assignment: FormAssignment | null;
};

export type EffectiveLaneResolution = {
  entryMode: AdmissionEntryMode;
  enabled: boolean;
  winningStep: 1 | 2 | 3 | 4 | null;
  assignment: FormAssignment | null;
  formName: string | null;
  isMissingWhileEnabled: boolean;
};

export function formatAssignmentSlotLabel(
  entryMode: AdmissionEntryMode | null | undefined,
): string {
  if (!entryMode) return "Shared fallback (All modes)";
  return getCandidateEntryModeLabel(entryMode);
}

/**
 * Resolves the 4 GLOBAL default slots (Shared fallback + UTME + Direct Entry + Transfer).
 * Prefers active assignments when multiple rows exist for a slot.
 */
export function resolveGlobalAssignmentSlots(
  assignments: FormAssignment[],
): GlobalFormSlot[] {
  const globals = assignments.filter(
    (a) =>
      a.assignmentScope === "GLOBAL" && a.purpose === "ADMISSION_APPLICATION",
  );

  return GLOBAL_SLOT_ORDER.map((slotMode) => {
    const matching = globals.filter(
      (a) => (a.entryMode ?? null) === slotMode,
    );
    const chosen =
      matching.find((a) => a.isActive) ?? matching[0] ?? null;

    return {
      entryMode: slotMode,
      slotLabel: formatAssignmentSlotLabel(slotMode),
      assignment: chosen,
    };
  });
}

/**
 * Groups ADMISSION_CYCLE assignments by cycle ID, preserving all lane slots
 * ordered cleanly with shared fallback (null) first.
 */
export function groupCycleAssignmentsByCycleId(
  assignments: FormAssignment[],
): Map<number, FormAssignment[]> {
  const map = new Map<number, FormAssignment[]>();

  for (const a of assignments) {
    if (
      a.assignmentScope !== "ADMISSION_CYCLE" ||
      a.assignmentReferenceId == null ||
      a.purpose !== "ADMISSION_APPLICATION"
    ) {
      continue;
    }

    const list = map.get(a.assignmentReferenceId) ?? [];
    list.push(a);
    map.set(a.assignmentReferenceId, list);
  }

  for (const [cycleId, list] of map.entries()) {
    list.sort(
      (a, b) =>
        GLOBAL_SLOT_ORDER.indexOf(a.entryMode ?? null) -
        GLOBAL_SLOT_ORDER.indexOf(b.entryMode ?? null),
    );
    map.set(cycleId, list);
  }

  return map;
}

/**
 * Executes the 4-step resolution cascade matching backend FormResolver:
 * 1. (ADMISSION_CYCLE, cycleId, entryMode)
 * 2. (ADMISSION_CYCLE, cycleId, null)
 * 3. (GLOBAL, null, entryMode)
 * 4. (GLOBAL, null, null)
 */
export function resolveEffectiveCycleLaneForm(
  cycleId: number,
  lane: AdmissionCycleLaneConfig,
  assignments: FormAssignment[],
  formsById: Map<number, FormTemplate>,
): EffectiveLaneResolution {
  const active = assignments.filter(
    (a) => a.isActive && a.purpose === "ADMISSION_APPLICATION",
  );

  const step1 =
    active.find(
      (a) =>
        a.assignmentScope === "ADMISSION_CYCLE" &&
        a.assignmentReferenceId === cycleId &&
        a.entryMode === lane.entryMode,
    ) ?? null;
  const step2 =
    active.find(
      (a) =>
        a.assignmentScope === "ADMISSION_CYCLE" &&
        a.assignmentReferenceId === cycleId &&
        (a.entryMode ?? null) === null,
    ) ?? null;
  const step3 =
    active.find(
      (a) =>
        a.assignmentScope === "GLOBAL" &&
        a.entryMode === lane.entryMode,
    ) ?? null;
  const step4 =
    active.find(
      (a) =>
        a.assignmentScope === "GLOBAL" &&
        (a.entryMode ?? null) === null,
    ) ?? null;

  let winningStep: 1 | 2 | 3 | 4 | null = null;
  let winner: FormAssignment | null = null;

  if (step1) {
    winningStep = 1;
    winner = step1;
  } else if (step2) {
    winningStep = 2;
    winner = step2;
  } else if (step3) {
    winningStep = 3;
    winner = step3;
  } else if (step4) {
    winningStep = 4;
    winner = step4;
  }

  const formName = winner
    ? (formsById.get(winner.formId)?.name ?? `Form #${winner.formId}`)
    : null;

  return {
    entryMode: lane.entryMode,
    enabled: lane.enabled,
    winningStep,
    assignment: winner,
    formName,
    isMissingWhileEnabled: lane.enabled && winner === null,
  };
}

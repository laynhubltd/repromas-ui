import type {
  MatricFormatActiveSlot,
  MatricFormatSlot,
  MatricNumberFormat,
} from "../types/matric-number-format";

export function matricSlotsMatch(a: MatricFormatSlot, b: MatricFormatSlot): boolean {
  return a === b || (a === null && b === null);
}

export function findActiveSlot(
  slots: MatricFormatActiveSlot[] | undefined,
  entryMode: MatricFormatSlot,
): MatricFormatActiveSlot | undefined {
  return slots?.find((slot) => matricSlotsMatch(slot.entryMode, entryMode));
}

export function isSlotActivationLocked(
  slots: MatricFormatActiveSlot[] | undefined,
  entryMode: MatricFormatSlot,
): boolean {
  return findActiveSlot(slots, entryMode)?.activationLocked === true;
}

export function canActivateDraft(
  format: MatricNumberFormat,
  slots: MatricFormatActiveSlot[] | undefined,
): boolean {
  if (format.status !== "DRAFT") return false;
  return !isSlotActivationLocked(slots, format.entryMode);
}

export function canDeactivateActive(
  format: MatricNumberFormat,
  slots: MatricFormatActiveSlot[] | undefined,
): boolean {
  if (format.status !== "ACTIVE") return false;
  return !isSlotActivationLocked(slots, format.entryMode);
}

export function canReactivateInactive(
  format: MatricNumberFormat,
  slots: MatricFormatActiveSlot[] | undefined,
): boolean {
  if (format.status !== "INACTIVE") return false;
  if (!isSlotActivationLocked(slots, format.entryMode)) return true;
  return format.existsIntakeStudentInSessionForFormatId === true;
}

export function findLiveFormatInSlot(
  slots: MatricFormatActiveSlot[] | undefined,
  entryMode: MatricFormatSlot,
): MatricNumberFormat | null {
  const slot = findActiveSlot(slots, entryMode);
  if (slot?.format?.status === "ACTIVE") return slot.format;
  return null;
}

import { describe, expect, it } from "vitest";
import type {
  MatricFormatActiveSlot,
  MatricNumberFormat,
} from "@/features/admission-config/tabs/matric-number-format/types/matric-number-format";
import {
  canActivateDraft,
  canDeactivateActive,
  canReactivateInactive,
  findLiveFormatInSlot,
  isSlotActivationLocked,
} from "@/features/admission-config/tabs/matric-number-format/utils/slotLifecycleEligibility";

const inactiveFormat: MatricNumberFormat = {
  id: 2,
  code: "retired",
  entryMode: null,
  status: "INACTIVE",
  template: "{sessionUpperYYYY}/REG/{seq:6}",
  tokenOptions: {},
  counterPartition: "TENANT",
  sequencePadding: 6,
  initialValue: 1,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-02T00:00:00Z",
};

const draftFormat: MatricNumberFormat = {
  ...inactiveFormat,
  id: 3,
  code: "draft-utme",
  entryMode: "UTME",
  status: "DRAFT",
};

const activeFormat: MatricNumberFormat = {
  ...inactiveFormat,
  id: 1,
  code: "live-default",
  status: "ACTIVE",
};

function slot(
  entryMode: MatricFormatActiveSlot["entryMode"],
  format: MatricNumberFormat | null,
  activationLocked: boolean,
): MatricFormatActiveSlot {
  return { entryMode, format, activationLocked };
}

const unlockedSlots: MatricFormatActiveSlot[] = [
  slot(null, activeFormat, false),
  slot("UTME", null, false),
];

const lockedDefaultSlot: MatricFormatActiveSlot[] = [
  slot(null, activeFormat, true),
];

describe("slotLifecycleEligibility", () => {
  it("isSlotActivationLocked reads activationLocked from active slots", () => {
    expect(isSlotActivationLocked(unlockedSlots, null)).toBe(false);
    expect(isSlotActivationLocked(lockedDefaultSlot, null)).toBe(true);
    expect(isSlotActivationLocked(unlockedSlots, "UTME")).toBe(false);
  });

  it("canActivateDraft blocks when slot is locked", () => {
    expect(canActivateDraft(draftFormat, unlockedSlots)).toBe(true);
    expect(
      canActivateDraft({ ...draftFormat, entryMode: null }, lockedDefaultSlot),
    ).toBe(false);
  });

  it("canDeactivateActive blocks when slot is locked", () => {
    expect(canDeactivateActive(activeFormat, unlockedSlots)).toBe(true);
    expect(canDeactivateActive(activeFormat, lockedDefaultSlot)).toBe(false);
  });

  it("allows reactivate for inactive format when slot is unlocked", () => {
    expect(canReactivateInactive(inactiveFormat, unlockedSlots)).toBe(true);
  });

  it("blocks reactivate when slot is locked and format did not serve intake", () => {
    expect(canReactivateInactive(inactiveFormat, lockedDefaultSlot)).toBe(false);
  });

  it("allows reactivate when slot is locked but format served intake", () => {
    expect(
      canReactivateInactive(
        { ...inactiveFormat, existsIntakeStudentInSessionForFormatId: true },
        lockedDefaultSlot,
      ),
    ).toBe(true);
  });

  it("never allows reactivate for non-inactive formats", () => {
    expect(canReactivateInactive(draftFormat, unlockedSlots)).toBe(false);
  });

  it("findLiveFormatInSlot returns active format in slot", () => {
    expect(findLiveFormatInSlot(unlockedSlots, null)).toEqual(activeFormat);
    expect(findLiveFormatInSlot(unlockedSlots, "UTME")).toBeNull();
  });

  it("locks are independent per slot — UTME locked does not block default draft", () => {
    const utmeLockedSlots: MatricFormatActiveSlot[] = [
      slot(null, activeFormat, false),
      slot("UTME", { ...activeFormat, id: 4, entryMode: "UTME" }, true),
    ];
    expect(canActivateDraft({ ...draftFormat, entryMode: null }, utmeLockedSlots)).toBe(true);
    expect(canActivateDraft(draftFormat, utmeLockedSlots)).toBe(false);
  });
});

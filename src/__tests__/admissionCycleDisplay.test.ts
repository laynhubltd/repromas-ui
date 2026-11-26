import { describe, expect, it } from "vitest";
import {
  buildBatchSlotKey,
  formatCycleBatchLabel,
  formatCycleLanesSummary,
  formatCycleOptionLabel,
  formatEntryBatchLabel,
  getAllowedIdentityModes,
  getOccupiedBatchSlots,
  isBatchSlotOccupied,
  isRollbackTransition,
  suggestNextBatchNo,
} from "@/features/admission-config/tabs/admission-cycle/utils/admissionCycleDisplay";
import type { AdmissionCycle } from "@/features/admission-config/tabs/admission-cycle/types/admission-cycle";

function makeCycle(
  overrides: Partial<AdmissionCycle> & Pick<AdmissionCycle, "id" | "sessionId">,
): AdmissionCycle {
  return {
    name: "Test Cycle",
    status: "PRE_PROCESSING",
    entryModes: [{ entryMode: "UTME", identityMode: "JAMB", enabled: true }],
    batchNo: 1,
    supersedesCycleId: null,
    startDate: null,
    endDate: null,
    createdAt: "2025-01-01T00:00:00+00:00",
    ...overrides,
  };
}

describe("admissionCycleDisplay", () => {
  it("getAllowedIdentityModes restricts TRANSFER to OPEN only", () => {
    expect(getAllowedIdentityModes("UTME")).toEqual(["JAMB", "OPEN"]);
    expect(getAllowedIdentityModes("DIRECT_ENTRY")).toEqual(["JAMB", "OPEN"]);
    expect(getAllowedIdentityModes("TRANSFER")).toEqual(["OPEN"]);
  });

  it("buildBatchSlotKey keys uniquely by sessionId and batchNo", () => {
    expect(buildBatchSlotKey(16, 1)).toBe("16:1");
    expect(buildBatchSlotKey(16, 2)).not.toBe(buildBatchSlotKey(16, 1));
  });

  it("getOccupiedBatchSlots and isBatchSlotOccupied track session-batch pairs", () => {
    const cycles = [
      makeCycle({ id: 1, sessionId: 16, batchNo: 1 }),
      makeCycle({ id: 2, sessionId: 16, batchNo: 2 }),
    ];
    const slots = getOccupiedBatchSlots(cycles);
    expect(slots.size).toBe(2);
    expect(isBatchSlotOccupied(cycles, 16, 1)).toBe(true);
    expect(isBatchSlotOccupied(cycles, 16, 3)).toBe(false);
  });

  it("suggestNextBatchNo increments max batchNo in the target session", () => {
    const cycles = [
      makeCycle({ id: 1, sessionId: 16, batchNo: 1 }),
      makeCycle({ id: 2, sessionId: 16, batchNo: 2 }),
      makeCycle({ id: 3, sessionId: 17, batchNo: 1 }),
    ];
    expect(suggestNextBatchNo(cycles, 16)).toBe(3);
    expect(suggestNextBatchNo(cycles, 17)).toBe(2);
    expect(suggestNextBatchNo(cycles, 99)).toBe(1);
  });

  it("formatCycleLanesSummary and formatCycleBatchLabel format active and paused lanes", () => {
    const lanes = [
      { entryMode: "UTME" as const, identityMode: "JAMB" as const, enabled: true },
      {
        entryMode: "DIRECT_ENTRY" as const,
        identityMode: "OPEN" as const,
        enabled: false,
      },
    ];
    expect(formatCycleLanesSummary(lanes)).toBe("UTME · DE (paused)");
    expect(formatCycleBatchLabel(lanes, 2)).toBe("UTME · DE (paused), Batch 2");
    expect(formatEntryBatchLabel("DIRECT_ENTRY", 1)).toBe(
      "Direct Entry, Batch 1",
    );
  });

  it("isRollbackTransition detects one-step rollback", () => {
    expect(isRollbackTransition("SCREENING", "APPLICATION_OPEN")).toBe(true);
    expect(isRollbackTransition("SCREENING", "LIST_RELEASED")).toBe(false);
    expect(isRollbackTransition("PRE_PROCESSING", "APPLICATION_OPEN")).toBe(
      false,
    );
  });

  it("formatCycleOptionLabel includes multi-lane batch and human status", () => {
    const cycle = makeCycle({
      id: 4,
      sessionId: 16,
      name: "2025/2026 UTME Admission",
      entryModes: [
        { entryMode: "UTME", identityMode: "JAMB", enabled: true },
        { entryMode: "TRANSFER", identityMode: "OPEN", enabled: true },
      ],
      batchNo: 2,
      status: "APPLICATION_OPEN",
    });
    expect(formatCycleOptionLabel(cycle)).toBe(
      "2025/2026 UTME Admission (UTME · Transfer, Batch 2 · Application Open)",
    );
  });
});

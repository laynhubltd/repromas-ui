import { describe, expect, it } from "vitest";
import {
  buildLaneSlotKey,
  formatCycleOptionLabel,
  getOccupiedLaneSlots,
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
    admissionIdentityMode: "JAMB",
    entryMode: "UTME",
    batchNo: 1,
    supersedesCycleId: null,
    startDate: null,
    endDate: null,
    createdAt: "2025-01-01T00:00:00+00:00",
    ...overrides,
  };
}

describe("admissionCycleDisplay", () => {
  it("buildLaneSlotKey isolates lanes by entry mode", () => {
    const utme = buildLaneSlotKey(16, "UTME", 1);
    const de = buildLaneSlotKey(16, "DIRECT_ENTRY", 1);
    expect(utme).not.toBe(de);
    expect(utme).toBe("16:UTME:1");
  });

  it("getOccupiedLaneSlots does not collide across entry modes in same session", () => {
    const cycles = [
      makeCycle({ id: 1, sessionId: 16, entryMode: "UTME", batchNo: 1 }),
      makeCycle({ id: 2, sessionId: 16, entryMode: "DIRECT_ENTRY", batchNo: 1 }),
    ];
    const slots = getOccupiedLaneSlots(cycles);
    expect(slots.size).toBe(2);
    expect(slots.has("16:UTME:1")).toBe(true);
    expect(slots.has("16:DIRECT_ENTRY:1")).toBe(true);
  });

  it("suggestNextBatchNo returns 3 when batches 1 and 2 exist in lane", () => {
    const cycles = [
      makeCycle({ id: 1, sessionId: 16, entryMode: "UTME", batchNo: 1 }),
      makeCycle({ id: 2, sessionId: 16, entryMode: "UTME", batchNo: 2 }),
      makeCycle({ id: 3, sessionId: 16, entryMode: "DIRECT_ENTRY", batchNo: 1 }),
    ];
    expect(suggestNextBatchNo(cycles, 16, "UTME")).toBe(3);
    expect(suggestNextBatchNo(cycles, 16, "DIRECT_ENTRY")).toBe(2);
  });

  it("isRollbackTransition detects one-step rollback", () => {
    expect(isRollbackTransition("SCREENING", "APPLICATION_OPEN")).toBe(true);
    expect(isRollbackTransition("SCREENING", "LIST_RELEASED")).toBe(false);
    expect(isRollbackTransition("PRE_PROCESSING", "APPLICATION_OPEN")).toBe(false);
  });

  it("formatCycleOptionLabel includes lane and human status", () => {
    const cycle = makeCycle({
      id: 4,
      sessionId: 16,
      name: "2025/2026 UTME Admission",
      entryMode: "UTME",
      batchNo: 2,
      status: "APPLICATION_OPEN",
    });
    expect(formatCycleOptionLabel(cycle)).toBe(
      "2025/2026 UTME Admission (UTME, Batch 2 · Application Open)",
    );
  });
});

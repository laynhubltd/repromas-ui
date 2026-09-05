import { describe, expect, it } from "vitest";
import {
  type CurrentTransitionDTO,
  type StudentPerformanceSummaryDTO,
  type TransitionReason,
} from "../types/student-transition-evaluation";

describe("Student Transition Status Adjustment Data Models", () => {
  it("enforces canonical TransitionReason enum codes", () => {
    const reasons: TransitionReason[] = [
      "EVALUATED",
      "DEFERRED_CLAMP",
      "SPILLOVER_RENEWAL",
      "MANUAL_OVERRIDE",
      "LAPSED_REGISTRATION",
    ];
    expect(reasons).toHaveLength(5);
  });

  it("structures StudentPerformanceSummaryDTO correctly with backend serializer keys", () => {
    const summary: StudentPerformanceSummaryDTO = {
      tcu: 18,
      tnp: 72.0,
      pcgpa: 4.0,
      gpa: 4.0,
      cgpa: 3.85,
      totalEarnedUnits: 36,
      academicStanding: "Good Standing",
      remark: "Normal Progress",
      unclearedCarryovers: [],
      recommendedTransitionStatusId: 1,
      isActionable: true,
      deferralReason: null,
      transitionReason: "EVALUATED",
    };

    expect(summary.academicStanding).toBe("Good Standing");
    expect(summary.totalEarnedUnits).toBe(36);
    expect(summary.isActionable).toBe(true);
  });

  it("structures CurrentTransitionDTO with status name and standing category", () => {
    const current: CurrentTransitionDTO = {
      transitionId: 101,
      levelId: 2,
      levelName: "ND II",
      sessionId: 5,
      sessionName: "2025/2026",
      status: "Good Standing",
      standing: "POSITIVE",
      isPromoted: true,
      isRepeated: false,
      transitionDate: "2026-01-15",
      isSpillover: false,
      hasExhaustedMaxResidency: false,
    };

    expect(current.status).toBe("Good Standing");
    expect(current.standing).toBe("POSITIVE");
    expect(current.isSpillover).toBe(false);
  });
});

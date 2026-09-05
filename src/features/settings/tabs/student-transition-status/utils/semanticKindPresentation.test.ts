import { describe, expect, it } from "vitest";
import {
  SEMANTIC_KIND_LABELS,
  SEMANTIC_KIND_PRESETS,
  lintTransitionStatusCoherence,
} from "./semanticKindPresentation";

describe("semanticKindPresentation", () => {
  it("defines human-readable labels for all 11 semantic kinds", () => {
    expect(SEMANTIC_KIND_LABELS.GOOD_STANDING).toBe("Good Standing");
    expect(SEMANTIC_KIND_LABELS.PROBATION).toBe("Probation");
    expect(SEMANTIC_KIND_LABELS.REPEAT).toBe("Repeat");
    expect(SEMANTIC_KIND_LABELS.SUSPENDED).toBe("Suspended");
    expect(SEMANTIC_KIND_LABELS.DEFERRED).toBe("Deferred / Leave");
    expect(SEMANTIC_KIND_LABELS.SPILLOVER).toBe("Spillover");
    expect(SEMANTIC_KIND_LABELS.ABSENT).toBe("Absent / Lapsed");
    expect(SEMANTIC_KIND_LABELS.WITHDRAWN).toBe("Withdrawn");
    expect(SEMANTIC_KIND_LABELS.DISMISSED).toBe("Dismissed");
    expect(SEMANTIC_KIND_LABELS.GRADUATED).toBe("Graduated");
    expect(SEMANTIC_KIND_LABELS.OTHER).toBe("Unclassified");
  });

  it("provides correct preset flags for DEFERRED and SUSPENDED (Admin-managed)", () => {
    const deferredPreset = SEMANTIC_KIND_PRESETS.DEFERRED;
    expect(deferredPreset.managedBy).toBe("ADMIN");
    expect(deferredPreset.stateCategory).toBe("NEUTRAL");
    expect(deferredPreset.exemptFromEvaluation).toBe(true);
    expect(deferredPreset.countsTowardsResidency).toBe(false);
    expect(deferredPreset.canRegisterCourses).toBe(false);

    const suspendedPreset = SEMANTIC_KIND_PRESETS.SUSPENDED;
    expect(suspendedPreset.managedBy).toBe("ADMIN");
    expect(suspendedPreset.countsTowardCareerCap).toBe(false);
    expect(suspendedPreset.canRegisterCourses).toBe(false);
  });

  it("provides correct preset flags for terminal statuses", () => {
    expect(SEMANTIC_KIND_PRESETS.WITHDRAWN.isTerminal).toBe(true);
    expect(SEMANTIC_KIND_PRESETS.DISMISSED.isTerminal).toBe(true);
    expect(SEMANTIC_KIND_PRESETS.GRADUATED.isTerminal).toBe(true);
    expect(SEMANTIC_KIND_PRESETS.GRADUATED.stateCategory).toBe("POSITIVE");
  });

  describe("lintTransitionStatusCoherence", () => {
    it("returns zero warnings for valid preset configurations", () => {
      const goodStandingWarnings = lintTransitionStatusCoherence({
        semanticKind: "GOOD_STANDING",
        ...SEMANTIC_KIND_PRESETS.GOOD_STANDING,
      });
      expect(goodStandingWarnings).toHaveLength(0);

      const deferredWarnings = lintTransitionStatusCoherence({
        semanticKind: "DEFERRED",
        ...SEMANTIC_KIND_PRESETS.DEFERRED,
      });
      expect(deferredWarnings).toHaveLength(0);
    });

    it("Rule 1: flags terminal kind on a non-terminal status", () => {
      const warnings = lintTransitionStatusCoherence({
        semanticKind: "WITHDRAWN",
        isTerminal: false,
      });
      expect(warnings).toContain("Terminal status type on a non-terminal status.");
    });

    it("Rule 2: flags GRADUATED marked adverse", () => {
      const warnings = lintTransitionStatusCoherence({
        semanticKind: "GRADUATED",
        stateCategory: "NEGATIVE",
        isTerminal: true,
      });
      expect(warnings).toContain("Graduation marked adverse.");
    });

    it("Rule 3: flags DEFERRED not exempt from evaluation", () => {
      const warnings = lintTransitionStatusCoherence({
        semanticKind: "DEFERRED",
        exemptFromEvaluation: false,
      });
      expect(warnings).toContain("Deferred students will still be evaluated.");
    });

    it("Rule 4: flags PROBATION/REPEAT set to promote level", () => {
      const probationWarnings = lintTransitionStatusCoherence({
        semanticKind: "PROBATION",
        levelProgression: "PROMOTE",
      });
      expect(probationWarnings).toContain("This status would still promote the student.");

      const repeatWarnings = lintTransitionStatusCoherence({
        semanticKind: "REPEAT",
        levelProgression: "PROMOTE",
      });
      expect(repeatWarnings).toContain("This status would still promote the student.");
    });

    it("Rule 5: flags SUSPENDED consuming career probation cap", () => {
      const warnings = lintTransitionStatusCoherence({
        semanticKind: "SUSPENDED",
        countsTowardCareerCap: true,
      });
      expect(warnings).toContain("Suspension will consume probation allowance.");
    });
  });
});

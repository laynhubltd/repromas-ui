import { describe, expect, it } from "vitest";
import {
  validateStepSequence,
  type MinimalEscalationStep,
} from "./stepSequenceValidator";

describe("validateStepSequence", () => {
  it("validates a healthy sequential ladder ending with a terminal step", () => {
    const steps: MinimalEscalationStep[] = [
      {
        id: 1,
        stepNumber: 1,
        label: "First Warning",
        actionTimingMode: "ANY_SEMESTER",
        studentTransitionStatusId: 1,
        isTerminal: false,
      },
      {
        id: 2,
        stepNumber: 2,
        label: "Second Warning",
        actionTimingMode: "ANY_SEMESTER",
        studentTransitionStatusId: 2,
        isTerminal: false,
      },
      {
        id: 3,
        stepNumber: 3,
        label: "Advised to Withdraw",
        actionTimingMode: "SESSION_END",
        studentTransitionStatusId: 3,
        isTerminal: true,
      },
    ];

    const result = validateStepSequence(steps);
    expect(result.isValid).toBe(true);
    expect(result.nextStepNumber).toBe(4);
    expect(result.hasTerminalStep).toBe(true);
    expect(result.isTerminalLast).toBe(true);
    expect(result.hasGaps).toBe(false);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("warns when ladder has no terminal step", () => {
    const steps: MinimalEscalationStep[] = [
      {
        id: 1,
        stepNumber: 1,
        label: "Warning 1",
        actionTimingMode: "ANY_SEMESTER",
        studentTransitionStatusId: 1,
        isTerminal: false,
      },
      {
        id: 2,
        stepNumber: 2,
        label: "Warning 2",
        actionTimingMode: "ANY_SEMESTER",
        studentTransitionStatusId: 2,
        isTerminal: false,
      },
    ];

    const result = validateStepSequence(steps);
    expect(result.hasTerminalStep).toBe(false);
    expect(result.warnings.some((w) => w.includes("never resolves"))).toBe(true);
  });

  it("warns when terminal step is followed by non-terminal steps", () => {
    const steps: MinimalEscalationStep[] = [
      {
        id: 1,
        stepNumber: 1,
        label: "Terminal Exit",
        actionTimingMode: "ANY_SEMESTER",
        studentTransitionStatusId: 1,
        isTerminal: true,
      },
      {
        id: 2,
        stepNumber: 2,
        label: "Additional Step",
        actionTimingMode: "ANY_SEMESTER",
        studentTransitionStatusId: 2,
        isTerminal: false,
      },
    ];

    const result = validateStepSequence(steps);
    expect(result.isTerminalLast).toBe(false);
    expect(
      result.warnings.some((w) => w.includes("non-terminal steps follow it")),
    ).toBe(true);
  });

  it("flags duplicate step numbers as errors", () => {
    const steps: MinimalEscalationStep[] = [
      {
        id: 1,
        stepNumber: 1,
        label: "Step 1A",
        actionTimingMode: "ANY_SEMESTER",
        studentTransitionStatusId: 1,
        isTerminal: false,
      },
      {
        id: 2,
        stepNumber: 1,
        label: "Step 1B",
        actionTimingMode: "ANY_SEMESTER",
        studentTransitionStatusId: 2,
        isTerminal: false,
      },
    ];

    const result = validateStepSequence(steps);
    expect(result.isValid).toBe(false);
    expect(result.hasDuplicates).toBe(true);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

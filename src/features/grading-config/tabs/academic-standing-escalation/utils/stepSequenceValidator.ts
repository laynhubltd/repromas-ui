import type { ActionTimingMode } from "../types/academic-standing-escalation";

export interface MinimalEscalationStep {
  id: number;
  academicStandingBoundaryId?: number;
  stepNumber: number;
  label: string;
  actionTimingMode: ActionTimingMode;
  semesterTypeId?: number | null;
  studentTransitionStatusId: number;
  isTerminal: boolean;
  studentTransitionStatus?: {
    id: number;
    name: string;
  } | null;
}

export interface StepSequenceValidationResult {
  isValid: boolean;
  nextStepNumber: number;
  hasTerminalStep: boolean;
  isTerminalLast: boolean;
  hasGaps: boolean;
  hasDuplicates: boolean;
  warnings: string[];
  errors: string[];
}

export function validateStepSequence(
  steps: MinimalEscalationStep[],
): StepSequenceValidationResult {
  if (!steps || steps.length === 0) {
    return {
      isValid: true,
      nextStepNumber: 1,
      hasTerminalStep: false,
      isTerminalLast: true,
      hasGaps: false,
      hasDuplicates: false,
      warnings: ["No escalation steps configured yet."],
      errors: [],
    };
  }

  const sorted = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);
  const errors: string[] = [];
  const warnings: string[] = [];

  let hasDuplicates = false;
  let hasGaps = false;
  const seenNumbers = new Set<number>();

  for (let i = 0; i < sorted.length; i++) {
    const num = sorted[i].stepNumber;
    if (seenNumbers.has(num)) {
      hasDuplicates = true;
      errors.push(`Duplicate step number ${num} detected.`);
    }
    seenNumbers.add(num);

    if (num !== i + 1) {
      hasGaps = true;
    }
  }

  if (hasGaps && !hasDuplicates) {
    warnings.push("Step sequence contains gaps or does not start at 1.");
  }

  const maxStep = sorted.reduce((max, s) => Math.max(max, s.stepNumber), 0);
  const nextStepNumber = maxStep + 1;

  const terminalSteps = sorted.filter((s) => s.isTerminal);
  const hasTerminalStep = terminalSteps.length > 0;

  let isTerminalLast = true;
  if (hasTerminalStep) {
    const lastStep = sorted[sorted.length - 1];
    if (!lastStep.isTerminal) {
      isTerminalLast = false;
      warnings.push(
        `Terminal action is configured on Step ${terminalSteps[0].stepNumber}, but non-terminal steps follow it.`,
      );
    }
  } else {
    warnings.push(
      "This ladder never resolves — students loop indefinitely on the final warning without terminal action.",
    );
  }

  return {
    isValid: errors.length === 0,
    nextStepNumber,
    hasTerminalStep,
    isTerminalLast,
    hasGaps,
    hasDuplicates,
    warnings,
    errors,
  };
}

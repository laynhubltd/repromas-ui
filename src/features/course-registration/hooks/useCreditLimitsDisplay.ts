import { useMemo } from "react";
import type { CreditLimits } from "../types/course-registration";

/**
 * Validation state for the current credit selection.
 */
export type CreditValidationState =
  | "valid"
  | "below_minimum"
  | "above_maximum"
  | "no_selection";

/**
 * Return type for useCreditLimitsDisplay.
 */
export type UseCreditLimitsDisplayResult = {
  /** Total credits from the current selection (new courses being added). */
  selectedCredits: number;
  /** Credits already registered this semester (read-only). */
  registeredCredits: number;
  /** Combined total: registeredCredits + selectedCredits. */
  totalCredits: number;
  /** Whether the upper bound is unlimited (max === -1). */
  isUnlimited: boolean;
  /** Current validation state. */
  validationState: CreditValidationState;
  /** Human-readable validation message, or null when valid. */
  validationMessage: string | null;
  /** Progress percentage (0–100) for the progress bar. null when unlimited. */
  progressPercent: number | null;
  /** Minimum credit units required. */
  minCredits: number;
  /** Maximum credit units allowed, or -1 for unlimited. */
  maxCredits: number;
};

/**
 * Hook containing all business logic for the CreditLimitsDisplay component.
 *
 * Responsibilities:
 * - Calculate total credits (registered + selected)
 * - Validate against minimum and maximum credit limits
 * - Handle unlimited upper bounds (max = -1)
 * - Produce human-readable validation messages
 * - Compute progress percentage for visualization
 *
 * Requirements: 5.4, 5.5, 5.6, 6.2, 6.3
 */
export function useCreditLimitsDisplay(
  creditLimits: CreditLimits,
  selectedCredits: number,
  registeredCredits: number,
): UseCreditLimitsDisplayResult {
  const { min, max } = creditLimits;
  const isUnlimited = max === -1;

  // ─── Total credits ────────────────────────────────────────────────────────
  /**
   * The combined total is what the student will have registered after
   * the current selection is submitted.
   *
   * Requirement 5.4: display running total of selected credit units
   */
  const totalCredits = useMemo(
    () => registeredCredits + selectedCredits,
    [registeredCredits, selectedCredits],
  );

  // ─── Validation state ─────────────────────────────────────────────────────
  /**
   * Determine whether the current selection satisfies credit limit rules.
   *
   * Requirement 5.5: enforce credit limit validation before submission
   * Requirement 6.2: validate selected credit units meet minimum requirements
   * Requirement 6.3: validate selected credit units do not exceed maximum limits
   */
  const validationState = useMemo<CreditValidationState>(() => {
    if (selectedCredits === 0 && registeredCredits === 0) return "no_selection";
    if (totalCredits < min) return "below_minimum";
    if (!isUnlimited && totalCredits > max) return "above_maximum";
    return "valid";
  }, [totalCredits, min, max, isUnlimited, selectedCredits, registeredCredits]);

  // ─── Validation message ───────────────────────────────────────────────────
  /**
   * Requirement 7.5: show current selection and required range when limits violated
   */
  const validationMessage = useMemo<string | null>(() => {
    switch (validationState) {
      case "below_minimum":
        return `Selected credit units (${totalCredits}) must be at least ${min}.`;
      case "above_maximum":
        return `Selected credit units (${totalCredits}) must not exceed ${max}.`;
      default:
        return null;
    }
  }, [validationState, totalCredits, min, max]);

  // ─── Progress percentage ──────────────────────────────────────────────────
  /**
   * Progress toward the maximum credit limit.
   * Returns null when there is no upper bound (unlimited).
   *
   * Requirement 5.6: display "No upper limit" when max = -1
   */
  const progressPercent = useMemo<number | null>(() => {
    if (isUnlimited) return null;
    if (max === 0) return 0;
    return Math.min(Math.round((totalCredits / max) * 100), 100);
  }, [isUnlimited, totalCredits, max]);

  return {
    selectedCredits,
    registeredCredits,
    totalCredits,
    isUnlimited,
    validationState,
    validationMessage,
    progressPercent,
    minCredits: min,
    maxCredits: max,
  };
}

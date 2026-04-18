import type { Rule } from "antd/es/form";

/**
 * Validation rules for the semester type selector.
 * Ensures a semester type is always selected before loading the course pool.
 */
export const semesterTypeRules: Rule[] = [
  { required: true, message: "Please select a semester type" },
];

/**
 * Validation rules for course selection.
 * Ensures at least one course is selected before submission.
 */
export const courseSelectionRules: Rule[] = [
  {
    validator: (_rule, value: number[]) => {
      if (!value || value.length === 0) {
        return Promise.reject(new Error("Please select at least one course"));
      }
      return Promise.resolve();
    },
  },
];

/**
 * Builds a credit limit validation rule based on the resolved credit limits.
 *
 * @param min - Minimum credit units required (always >= 0)
 * @param max - Maximum credit units allowed (-1 means no upper limit)
 * @param selectedCredits - Currently selected credit unit total
 */
export function buildCreditLimitRule(
  min: number,
  max: number,
  selectedCredits: number,
): Rule {
  return {
    validator: () => {
      if (selectedCredits < min) {
        return Promise.reject(
          new Error(
            `Selected credit units (${selectedCredits}) must be at least ${min}.`,
          ),
        );
      }
      if (max !== -1 && selectedCredits > max) {
        return Promise.reject(
          new Error(
            `Selected credit units (${selectedCredits}) must not exceed ${max}.`,
          ),
        );
      }
      return Promise.resolve();
    },
  };
}

/**
 * Builds an AntD Form Rule that validates a list of selected configIds against
 * a list of mandatory configIds.
 *
 * @param mandatoryConfigIds - configIds that must all be present in the value
 */
export function buildMandatoryCourseRule(mandatoryConfigIds: number[]): Rule {
  return {
    validator: (_rule, value: number[]) => {
      const selectedSet = new Set(value ?? []);
      const missing = mandatoryConfigIds.filter((id) => !selectedSet.has(id));
      if (missing.length > 0) {
        return Promise.reject(
          new Error(`Please select all mandatory courses before submitting.`),
        );
      }
      return Promise.resolve();
    },
  };
}

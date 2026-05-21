import type { Rule } from "antd/es/form";
import type { PolicyScope } from "../types/course-assessment-policy";

// ─── Conditional Validators ───────────────────────────────────────────────────

/**
 * Returns validation rules for the scoreCapValue field.
 * When applyScoreCapOnVeto=true: required, must be a number in [0, 100).
 * When applyScoreCapOnVeto=false: validator that passes null (no-op, field is disabled).
 */
export function validateScoreCapValue(applyScoreCapOnVeto: boolean): Rule[] {
  if (!applyScoreCapOnVeto) {
    return [
      {
        validator: (_rule, value) => {
          // When checkbox is unchecked, accept null/undefined (field is disabled)
          if (value === null || value === undefined) {
            return Promise.resolve();
          }
          return Promise.resolve();
        },
      },
    ];
  }

  return [
    {
      required: true,
      message: "Score cap value is required when applying score cap on veto",
    },
    { type: "number", message: "Score cap value must be a number" },
    {
      validator: (_rule, value: number | null) => {
        if (value === null || value === undefined) {
          return Promise.reject(new Error("Score cap value is required"));
        }
        if (value < 0 || value >= 100) {
          return Promise.reject(
            new Error("Score cap value must be between 0 and 99.99"),
          );
        }
        return Promise.resolve();
      },
    },
  ];
}

/**
 * Returns validation rules for the minPassPercentage field.
 * When mustPass=true: required, must be a number in [0, 100].
 * When mustPass=false: validator that passes null (no-op, field is disabled).
 */
export function validateMinPassPercentage(mustPass: boolean): Rule[] {
  if (!mustPass) {
    return [
      {
        validator: (_rule, value) => {
          // When checkbox is unchecked, accept null/undefined (field is disabled)
          if (value === null || value === undefined) {
            return Promise.resolve();
          }
          return Promise.resolve();
        },
      },
    ];
  }

  return [
    {
      required: true,
      message: "Minimum pass percentage is required when must pass is enabled",
    },
    { type: "number", message: "Minimum pass percentage must be a number" },
    {
      validator: (_rule, value: number | null) => {
        if (value === null || value === undefined) {
          return Promise.reject(
            new Error("Minimum pass percentage is required"),
          );
        }
        if (value < 0 || value > 100) {
          return Promise.reject(
            new Error("Minimum pass percentage must be between 0 and 100"),
          );
        }
        return Promise.resolve();
      },
    },
  ];
}

/**
 * Returns validation rules for the component code field.
 * Required, max 20 characters, pattern ^[a-zA-Z0-9_]{1,20}$ (alphanumeric and underscores only).
 */
export function validateComponentCode(): Rule[] {
  return [
    { required: true, message: "Component code is required" },
    { max: 20, message: "Component code must be at most 20 characters" },
    {
      pattern: /^[a-zA-Z0-9_]{1,20}$/,
      message:
        "Component code must be 1-20 characters, alphanumeric and underscores only",
    },
  ];
}

/**
 * Returns validation rules for the configId field.
 * When scope="COURSE": required, must be a positive integer (> 0).
 * When scope="GLOBAL": validator that passes null (no-op, field is disabled).
 */
export function validateConfigId(scope: PolicyScope): Rule[] {
  if (scope === "GLOBAL") {
    return [
      {
        validator: (_rule, value) => {
          // When scope is GLOBAL, accept null/undefined (field is disabled)
          if (value === null || value === undefined) {
            return Promise.resolve();
          }
          return Promise.resolve();
        },
      },
    ];
  }

  return [
    {
      required: true,
      message: "Course configuration is required for COURSE scope",
    },
    { type: "number", message: "Course configuration must be a number" },
    {
      validator: (_rule, value: number | null) => {
        if (value === null || value === undefined) {
          return Promise.reject(new Error("Course configuration is required"));
        }
        if (value <= 0) {
          return Promise.reject(
            new Error("Course configuration must be a positive integer"),
          );
        }
        return Promise.resolve();
      },
    },
  ];
}

// ─── Standard Rule Arrays ─────────────────────────────────────────────────────

/**
 * Validation rules for breakdown name field.
 * Required, max 100 characters.
 */
export const breakdownNameRules: Rule[] = [
  { required: true, message: "Breakdown name is required" },
  { max: 100, message: "Breakdown name must be at most 100 characters" },
];

/**
 * Validation rules for total weight percentage field.
 * Required, number in range (0.01, 100] (> 0 and <= 100).
 */
export const totalWeightPercentageRules: Rule[] = [
  { required: true, message: "Total weight percentage is required" },
  { type: "number", message: "Total weight percentage must be a number" },
  {
    validator: (_rule, value: number | null) => {
      if (value === null || value === undefined) {
        return Promise.reject(new Error("Total weight percentage is required"));
      }
      if (value <= 0 || value > 100) {
        return Promise.reject(
          new Error(
            "Total weight percentage must be greater than 0 and at most 100",
          ),
        );
      }
      return Promise.resolve();
    },
  },
];

/**
 * Validation rules for component weight percentage field.
 * Required, number in range (0.01, 100] (> 0 and <= 100).
 */
export const weightPercentageRules: Rule[] = [
  { required: true, message: "Weight percentage is required" },
  { type: "number", message: "Weight percentage must be a number" },
  {
    validator: (_rule, value: number | null) => {
      if (value === null || value === undefined) {
        return Promise.reject(new Error("Weight percentage is required"));
      }
      if (value <= 0 || value > 100) {
        return Promise.reject(
          new Error("Weight percentage must be greater than 0 and at most 100"),
        );
      }
      return Promise.resolve();
    },
  },
];

/**
 * Returns validation rules for the component weightPercentage field that also
 * enforces the policy total weight cap.
 *
 * @param totalWeightPercentage - the policy's total weight budget
 * @param usedWeight            - sum of existing components' weights (excluding the
 *                                component being edited in edit mode)
 */
export function validateWeightPercentage(
  totalWeightPercentage: number,
  usedWeight: number,
): Rule[] {
  return [
    { required: true, message: "Weight percentage is required" },
    { type: "number", message: "Weight percentage must be a number" },
    {
      validator: (_rule, value: number | null) => {
        if (value === null || value === undefined) {
          return Promise.reject(new Error("Weight percentage is required"));
        }
        if (value <= 0) {
          return Promise.reject(
            new Error("Weight percentage must be greater than 0"),
          );
        }
        const remaining = totalWeightPercentage - usedWeight;
        if (value > remaining) {
          return Promise.reject(
            new Error(
              `Weight percentage cannot exceed the remaining budget of ${remaining.toFixed(2)}% (policy total: ${totalWeightPercentage}%)`,
            ),
          );
        }
        return Promise.resolve();
      },
    },
  ];
}

/**
 * Validation rules for component name field.
 * Required, max 100 characters.
 */
export const componentNameRules: Rule[] = [
  { required: true, message: "Component name is required" },
  { max: 100, message: "Component name must be at most 100 characters" },
];

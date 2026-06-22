export type ValidationViolation = {
  propertyPath: string;
  message: string;
};

export function mapViolationToFieldErrors(
  violations: ValidationViolation[],
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const v of violations) {
    const parts = v.propertyPath.split(".");
    if (parts.length >= 2) {
      const fieldKey = parts[parts.length - 1];
      errors[fieldKey] = v.message;
    } else if (parts.length === 1) {
      errors[parts[0]] = v.message;
    }
  }

  return errors;
}

export function errorsToObject(errors: Record<string, string[] | string>): Record<string, string> {
  const errorObject: Record<string, string> = {};
  for (const key in errors) {
    if (Object.prototype.hasOwnProperty.call(errors, key)) {
      const error = errors[key];
      if (Array.isArray(error)) {
        errorObject[key] = error.join(", ");
      } else {
        errorObject[key] = error;
      }
    }
  }
  return errorObject;
}

export function errorsToString(errors: Record<string, string[] | string>): string {
  const errorMessages: string[] = [];
  for (const key in errors) {
    if (Object.prototype.hasOwnProperty.call(errors, key)) {
      const error = errors[key];
      if (Array.isArray(error)) {
        errorMessages.push(`${key}: ${error.join(", ")}`);
      } else {
        errorMessages.push(`${key}: ${error}`);
      }
    }
  }
  return errorMessages.join("; ");
}

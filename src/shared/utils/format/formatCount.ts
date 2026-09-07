/**
 * Formats integer/numerical counts with standard locale thousands separators.
 * Safely handles null, undefined, and non-numeric inputs.
 */
export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "0";
  }
  return value.toLocaleString();
}

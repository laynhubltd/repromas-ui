/**
 * Calculates a safe percentage, avoiding NaN% and division-by-zero errors.
 * Returns 0 if denominator is 0, negative, null, or undefined.
 */
export function safePercent(
  numerator: number | null | undefined,
  denominator: number | null | undefined,
  decimals: number = 1
): number {
  if (
    !numerator ||
    !denominator ||
    denominator <= 0 ||
    numerator <= 0 ||
    Number.isNaN(numerator) ||
    Number.isNaN(denominator)
  ) {
    return 0;
  }

  const rawPercent = (numerator / denominator) * 100;
  const factor = Math.pow(10, decimals);
  return Math.round(rawPercent * factor) / factor;
}

/**
 * Returns a ratio between 0 and 1 safely.
 */
export function safeRatio(
  numerator: number | null | undefined,
  denominator: number | null | undefined
): number {
  if (
    !numerator ||
    !denominator ||
    denominator <= 0 ||
    numerator <= 0 ||
    Number.isNaN(numerator) ||
    Number.isNaN(denominator)
  ) {
    return 0;
  }

  return Math.min(1, Math.max(0, numerator / denominator));
}

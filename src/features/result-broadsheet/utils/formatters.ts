export function formatCgpa(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "—";
  }
  return Number(value).toFixed(2);
}

export function formatGpa(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "—";
  }
  return Number(value).toFixed(2);
}

export function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "—";
  }
  return String(value);
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0.0%";
  }
  return `${Number(value).toFixed(1)}%`;
}

type LineWithAmount = {
  amount?: string | number | null;
};

export function formatAmountString(value: number): string {
  return value.toFixed(2);
}

export function computeGrossPreview(lines: LineWithAmount[]): string {
  const total = lines.reduce((sum, line) => {
    const raw = line.amount;
    if (raw === undefined || raw === null || raw === "") return sum;
    const parsed = typeof raw === "number" ? raw : parseFloat(String(raw));
    if (Number.isNaN(parsed)) return sum;
    return sum + parsed;
  }, 0);
  return formatAmountString(total);
}

export function formatCurrencyDisplay(amount: string | number): string {
  const parsed =
    typeof amount === "number" ? amount : parseFloat(String(amount));
  if (Number.isNaN(parsed)) return "—";
  return `₦${parsed.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

import type { FeeItem } from "../types/fee-item";

export function formatAccountingCode(code: string | null): string {
  return code?.trim() ? code.trim() : "—";
}

export function formatFeeItemCreatedAt(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getFeeItemStatusLabel(item: FeeItem): string {
  return item.isActive ? "Active" : "Inactive";
}

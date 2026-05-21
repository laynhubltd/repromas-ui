import type { QuotaCategory } from "@/features/admission-config/tabs/geography-rule/types/geography-rule";

export type QuotaTypeFormValue = "CATCHMENT" | "ELDS";

export const QUOTA_TYPE_FORM_OPTIONS: {
  value: QuotaTypeFormValue;
  label: string;
  isCatchment: boolean;
  isElds: boolean;
}[] = [
  { value: "CATCHMENT", label: "Catchment", isCatchment: true, isElds: false },
  { value: "ELDS", label: "ELDS", isCatchment: false, isElds: true },
];

export const QUOTA_CATEGORY_LABELS: Record<QuotaCategory, string> = {
  CATCHMENT: "Catchment",
  ELDS: "ELDS",
  MERIT: "Merit",
};

export const QUOTA_CATEGORY_TAG_COLORS: Record<QuotaCategory, string> = {
  CATCHMENT: "blue",
  ELDS: "orange",
  MERIT: "default",
};

export function flagsToQuotaTypeFormValue(
  _isCatchment: boolean,
  isElds: boolean,
): QuotaTypeFormValue {
  return isElds ? "ELDS" : "CATCHMENT";
}

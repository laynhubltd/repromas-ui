import type { SegmentedProps } from "antd";
import type { ReactNode } from "react";

export type NormalizedSegmentedOption<T extends string | number = string> = {
  label: ReactNode;
  value: T;
  disabled?: boolean;
};

export function normalizeSegmentedOptions<T extends string | number = string>(
  options: SegmentedProps<T>["options"],
): NormalizedSegmentedOption<T>[] {
  if (!options) return [];

  return options.map((option) => {
    if (typeof option === "string" || typeof option === "number") {
      return { label: option, value: option as T };
    }

    return {
      label: option.label ?? option.value,
      value: option.value,
      disabled: option.disabled,
    };
  });
}

export function getSegmentedOptionLabel<T extends string | number>(
  options: NormalizedSegmentedOption<T>[],
  value: T | undefined,
): ReactNode {
  if (value == null) return "";
  const match = options.find((option) => option.value === value);
  return match?.label ?? String(value);
}

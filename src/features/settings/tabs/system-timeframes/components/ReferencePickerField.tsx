// Feature: settings-timeframe
import { Select, Spin } from "antd";
import { useEffect, useState } from "react";
import { useReferencePickerOptions } from "../hooks/useReferencePickerOptions";
import type { Scope } from "../types/system-timeframe";

type ReferencePickerFieldProps = {
  scope: Scope;
  /** Injected by Form.Item when used inside a form */
  value?: number | null;
  /** Injected by Form.Item when used inside a form */
  onChange?: (id: number | null) => void;
};

/**
 * ReferencePickerField — scope-aware reference picker.
 *
 * - GLOBAL: renders nothing (no picker needed)
 * - FACULTY/DEPARTMENT/PROGRAM/LEVEL: searchable Select with live API search
 * - STUDENT: requires typing a matric number before results load
 *
 * Clears value when scope changes.
 */
export function ReferencePickerField({ scope, value = null, onChange }: ReferencePickerFieldProps) {
  const [search, setSearch] = useState("");

  // Clear search and value when scope changes
  useEffect(() => {
    setSearch("");
    onChange?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const { options, isLoading } = useReferencePickerOptions(scope, search);

  if (scope === "GLOBAL") {
    return null;
  }

  const isStudent = scope === "STUDENT";
  const placeholder = isStudent
    ? "Type matric number to search…"
    : `Search ${scope.charAt(0) + scope.slice(1).toLowerCase()}…`;

  const selectOptions = options.map((opt) => ({ value: opt.id, label: opt.label }));

  return (
    <Select
      showSearch
      filterOption={false}
      value={value ?? undefined}
      onChange={(val) => onChange?.(val ?? null)}
      onSearch={setSearch}
      onClear={() => {
        onChange?.(null);
        setSearch("");
      }}
      allowClear
      placeholder={placeholder}
      style={{ width: "100%", height: 40 }}
      options={selectOptions}
      loading={isLoading}
      notFoundContent={
        isLoading ? (
          <Spin size="small" />
        ) : isStudent && !search ? (
          <span style={{ fontSize: 12, color: "#999" }}>Type a matric number to search</span>
        ) : (
          <span style={{ fontSize: 12, color: "#999" }}>No results found</span>
        )
      }
    />
  );
}

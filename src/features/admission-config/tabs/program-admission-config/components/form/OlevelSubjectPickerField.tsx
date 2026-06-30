import { Select, Spin } from "antd";
import { useOlevelSubjectPickerOptions } from "../../hooks/useOlevelSubjectPickerOptions";

type OlevelSubjectPickerFieldProps = {
  /** Injected by Form.Item when used inside a form */
  value?: number | null;
  /** Injected by Form.Item when used inside a form */
  onChange?: (id: number | null) => void;
  enabled?: boolean;
  placeholder?: string;
};

export function OlevelSubjectPickerField({
  value = null,
  onChange,
  enabled = true,
  placeholder = "Search O-Level subject…",
}: OlevelSubjectPickerFieldProps) {
  const { options, isLoading, search, setSearch } = useOlevelSubjectPickerOptions(
    enabled,
    value,
  );

  const selectOptions = options.map((opt) => ({
    value: opt.id,
    label: opt.label,
  }));

  return (
    <Select
      showSearch
      filterOption={false}
      value={value ?? undefined}
      searchValue={search}
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
      disabled={!enabled}
      notFoundContent={
        isLoading ? (
          <Spin size="small" />
        ) : (
          <span style={{ fontSize: 12, color: "#999" }}>No subjects found</span>
        )
      }
    />
  );
}

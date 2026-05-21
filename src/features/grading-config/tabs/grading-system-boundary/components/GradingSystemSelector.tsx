// Feature: grading-config
import { Select } from "antd";
import { useListGradingSystemsQuery } from "../../grading-system/api/gradingSystemApi";

type GradingSystemSelectorProps = {
  value: number | null;
  onChange: (id: number | null) => void;
};

export function GradingSystemSelector({
  value,
  onChange,
}: GradingSystemSelectorProps) {
  const { data, isLoading } = useListGradingSystemsQuery({
    sort: "name:asc",
    itemsPerPage: 100,
  });

  const systems = data?.member ?? [];

  return (
    <Select
      placeholder={
        isLoading ? "Loading grading systems…" : "Select a grading system"
      }
      loading={isLoading}
      disabled={isLoading}
      value={value ?? undefined}
      onChange={(val) => onChange(val ?? null)}
      allowClear
      showSearch
      optionFilterProp="label"
      style={{ minWidth: 280 }}
      options={systems.map((s) => ({ value: s.id, label: s.name }))}
    />
  );
}

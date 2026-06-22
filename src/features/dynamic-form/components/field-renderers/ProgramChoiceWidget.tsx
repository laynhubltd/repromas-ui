import { Form, Select } from "antd";

type ProgramChoiceWidgetProps = {
  value?: { first_choice?: number; second_choice?: number };
  onChange: (value: { first_choice?: number; second_choice?: number }) => void;
  options: Array<{ value: number; label: string }>;
  disabled?: boolean;
};

export function ProgramChoiceWidget({
  value,
  onChange,
  options,
  disabled,
}: ProgramChoiceWidgetProps) {
  const handleChange = (key: "first_choice" | "second_choice", v: number | undefined) => {
    onChange({ ...value, [key]: v });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Form.Item label="First Choice" style={{ marginBottom: 0 }}>
        <Select
          value={value?.first_choice}
          onChange={(v) => handleChange("first_choice", v)}
          options={options}
          disabled={disabled}
          placeholder="Select first choice"
          allowClear
          style={{ width: "100%" }}
        />
      </Form.Item>
      <Form.Item label="Second Choice" style={{ marginBottom: 0 }}>
        <Select
          value={value?.second_choice}
          onChange={(v) => handleChange("second_choice", v)}
          options={options}
          disabled={disabled}
          placeholder="Select second choice"
          allowClear
          style={{ width: "100%" }}
        />
      </Form.Item>
    </div>
  );
}

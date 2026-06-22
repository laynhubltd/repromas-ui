import { Form } from "antd";
import { useCallback, useEffect } from "react";
import { defaultStaticOptionsForColumn } from "../utils/optionsConfigForm";
import {
  buildEnumFromStaticOptions,
  parseStaticOptionsJson,
  rowsToFieldOptions,
  serializeStaticOptionsJson,
  validateStaticOptionRows,
  type StaticOptionRow,
} from "../utils/staticOptionsForm";

type StaticOptionsFormValues = {
  rows: StaticOptionRow[];
};

export function useStaticOptionsModal(
  open: boolean,
  initialJson: string | undefined,
  columnName: string | undefined,
  onApply: (json: string, enumValues: string[]) => void,
  onClose: () => void,
) {
  const [form] = Form.useForm<StaticOptionsFormValues>();

  useEffect(() => {
    if (!open) return;
    let rows = parseStaticOptionsJson(initialJson);
    if (rows.length === 0) {
      const defaults = defaultStaticOptionsForColumn(columnName);
      if (defaults.length > 0) {
        rows = defaults.map((o) => ({
          value: String(o.value),
          label: o.label,
        }));
      } else {
        rows = [{ value: "", label: "" }];
      }
    }
    form.setFieldsValue({ rows });
  }, [open, initialJson, columnName, form]);

  const reset = useCallback(() => {
    form.resetFields();
  }, [form]);

  const handleApplyGenderPreset = () => {
    const defaults = defaultStaticOptionsForColumn("gender");
    form.setFieldsValue({
      rows: defaults.map((o) => ({
        value: String(o.value),
        label: o.label,
      })),
    });
  };

  const handleApply = async () => {
    const values = await form.validateFields();
    const rows = values.rows ?? [];
    const validationError = validateStaticOptionRows(rows);
    if (validationError) {
      form.setFields([{ name: "rows", errors: [validationError] }]);
      return;
    }
    const options = rowsToFieldOptions(rows);
    const json = serializeStaticOptionsJson(rows);
    const enumValues = buildEnumFromStaticOptions(options);
    onApply(json, enumValues);
    reset();
    onClose();
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return {
    state: { showGenderPreset: columnName === "gender" },
    actions: { handleApply, handleCancel, handleApplyGenderPreset },
    form,
  };
}

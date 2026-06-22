import type { FieldType } from "@/features/dynamic-form/types";
import { useToken } from "@/shared/hooks/useToken";
import {
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Typography,
} from "antd";
import { useValidationRuleModal } from "../../hooks/useFieldRuleModal";
import { isWidgetFieldType } from "../../utils/fieldConfigDefaults";
import {
  isNumericValueType,
  isStringValueType,
  STRING_FORMAT_OPTIONS,
  VALUE_TYPE_OPTIONS,
  type JsonSchemaValueType,
} from "../../utils/validationRuleForm";
import {
  validationMaxLengthRules,
  validationMinLengthRules,
  validationPatternRules,
  validationRangeRules,
} from "../../utils/validators";

export type ValidationRuleFormModalProps = {
  open: boolean;
  fieldType: FieldType;
  initialSchema: Record<string, unknown>;
  initialIsRequired: boolean;
  onClose: () => void;
  onApply: (
    schema: Record<string, unknown>,
    json: string,
    isRequired: boolean,
  ) => void;
};

function ValidationRuleFields({ fieldType }: { fieldType: FieldType }) {
  const form = Form.useFormInstance();
  const valueType = Form.useWatch("valueType", form) as JsonSchemaValueType | undefined;
  const isWidget = isWidgetFieldType(fieldType);

  return (
    <>
      <Form.Item
        name="valueType"
        label="Value type"
        rules={[{ required: true, message: "Select a value type" }]}
        extra="Determines what kind of data this field accepts"
      >
        <Select
          options={VALUE_TYPE_OPTIONS}
          disabled={isWidget}
          placeholder="Select value type"
        />
      </Form.Item>

      <Form.Item name="required" label="Required" valuePropName="checked">
        <Switch checkedChildren="Yes" unCheckedChildren="No" />
      </Form.Item>

      <Divider style={{ margin: "12px 0" }} />

      {isStringValueType(valueType) && (
        <>
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
            Text rules
          </Typography.Text>
          <Form.Item name="format" label="Format">
            <Select options={STRING_FORMAT_OPTIONS} placeholder="No special format" />
          </Form.Item>
          <Form.Item name="minLength" label="Minimum length" rules={validationMinLengthRules}>
            <InputNumber min={0} style={{ width: "100%" }} placeholder="No minimum" />
          </Form.Item>
          <Form.Item name="maxLength" label="Maximum length" rules={validationMaxLengthRules}>
            <InputNumber min={1} style={{ width: "100%" }} placeholder="No maximum" />
          </Form.Item>
          <Form.Item
            name="pattern"
            label="Pattern (regular expression)"
            rules={validationPatternRules}
            extra="Optional. Example: ^[A-Za-z]+$ for letters only"
          >
            <Input placeholder="^[A-Za-z0-9]+$" />
          </Form.Item>
          <Form.Item
            name="enumValues"
            label="Allowed values"
            extra="Optional. Press Enter after each value to restrict input to a fixed list"
          >
            <Select mode="tags" placeholder="Add allowed values" tokenSeparators={[","]} />
          </Form.Item>
        </>
      )}

      {isNumericValueType(valueType) && (
        <>
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
            Number rules
          </Typography.Text>
          <Form.Item name="minimum" label="Minimum" rules={validationRangeRules}>
            <InputNumber style={{ width: "100%" }} placeholder="No minimum" />
          </Form.Item>
          <Form.Item name="maximum" label="Maximum" rules={validationRangeRules}>
            <InputNumber style={{ width: "100%" }} placeholder="No maximum" />
          </Form.Item>
          <Form.Item
            name="exclusiveMinimum"
            label="Exclusive minimum"
            rules={validationRangeRules}
            extra="Value must be greater than this number"
          >
            <InputNumber style={{ width: "100%" }} placeholder="Not set" />
          </Form.Item>
          <Form.Item
            name="exclusiveMaximum"
            label="Exclusive maximum"
            rules={validationRangeRules}
            extra="Value must be less than this number"
          >
            <InputNumber style={{ width: "100%" }} placeholder="Not set" />
          </Form.Item>
          <Form.Item
            name="multipleOf"
            label="Multiple of"
            rules={validationRangeRules}
            extra="Value must be divisible by this number"
          >
            <InputNumber min={0} style={{ width: "100%" }} placeholder="Not set" />
          </Form.Item>
        </>
      )}

      {valueType === "boolean" && (
        <Typography.Paragraph type="secondary">
          Boolean fields accept yes/no (true/false) values. No additional rules apply.
        </Typography.Paragraph>
      )}

      {valueType === "object" && (
        <Typography.Paragraph type="secondary">
          Object fields hold structured data (e.g. widget payloads). Validation is managed by
          the platform handler.
        </Typography.Paragraph>
      )}

      {!valueType && (
        <Typography.Paragraph type="secondary">
          Select a value type to configure validation rules.
        </Typography.Paragraph>
      )}
    </>
  );
}

export function ValidationRuleFormModal({
  open,
  fieldType,
  initialSchema,
  initialIsRequired,
  onClose,
  onApply,
}: ValidationRuleFormModalProps) {
  const token = useToken();
  const { actions, form } = useValidationRuleModal(
    fieldType,
    initialSchema,
    initialIsRequired,
    open,
    onApply,
    onClose,
  );
  const { handleApply, handleCancel } = actions;

  return (
    <Modal
      title="Validation rules"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={560}
      destroyOnHidden
      styles={{
        body: { padding: `${token.paddingSM}px ${token.paddingSM}px` },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <Form form={form} layout="vertical" onFinish={handleApply}>
        <ValidationRuleFields fieldType={fieldType} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Apply
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

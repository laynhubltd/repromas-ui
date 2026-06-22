import type { FormField, VisibilityConfig } from "@/features/dynamic-form/types";
import { useToken } from "@/shared/hooks/useToken";
import { Button, Form, Input, Modal, Select, Switch, Typography } from "antd";
import { useVisibilityRuleModal } from "../../hooks/useFieldRuleModal";
import type { VisibilityFormSlice } from "../../utils/visibilityRuleForm";
import {
  getStaticOptionsForField,
  getTriggerFieldOptions,
} from "../../utils/visibilityRuleForm";
import {
  visibilityFieldRules,
  visibilityInValuesRules,
  visibilityValueRules,
} from "../../utils/validators";

export type VisibilityRuleFormModalProps = {
  open: boolean;
  sectionFields: FormField[];
  currentFieldKey: string;
  initialConfig: VisibilityConfig | null;
  onClose: () => void;
  onApply: (slice: VisibilityFormSlice) => void;
};

const OPERATOR_OPTIONS = [
  { value: "equals", label: "is equal to" },
  { value: "not_equals", label: "is not equal to" },
  { value: "in", label: "is one of" },
];

export function VisibilityRuleFormModal({
  open,
  sectionFields,
  currentFieldKey,
  initialConfig,
  onClose,
  onApply,
}: VisibilityRuleFormModalProps) {
  const token = useToken();
  const { actions, form } = useVisibilityRuleModal(
    sectionFields,
    currentFieldKey,
    initialConfig,
    open,
    onApply,
    onClose,
  );
  const { handleApply, handleCancel } = actions;

  const triggerOptions = getTriggerFieldOptions(sectionFields, currentFieldKey);

  return (
    <Modal
      title="Visibility rules"
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
        <Form.Item
          name="visibilityEnabled"
          label="Conditional visibility"
          valuePropName="checked"
        >
          <Switch checkedChildren="On" unCheckedChildren="Off" />
        </Form.Item>

        <Typography.Paragraph
          type="secondary"
          style={{ fontSize: token.fontSizeSM, marginBottom: 16 }}
        >
          Leave off to always show this field. Hidden fields are not validated at runtime.
          Only single conditions are supported (no AND/OR groups).
        </Typography.Paragraph>

        <Form.Item noStyle shouldUpdate>
          {() => {
            const enabled = form.getFieldValue("visibilityEnabled");
            if (!enabled) return null;

            const triggerFieldKey = form.getFieldValue("visibilityField") as
              | string
              | undefined;
            const operator = form.getFieldValue("visibilityOperator") as
              | "equals"
              | "not_equals"
              | "in"
              | undefined;
            const triggerMeta = triggerOptions.find((o) => o.value === triggerFieldKey);
            const staticOptions = triggerMeta
              ? getStaticOptionsForField(triggerMeta.optionsConfig)
              : [];

            return (
              <>
                <Form.Item
                  name="visibilityField"
                  label="Show this field when"
                  rules={visibilityFieldRules}
                >
                  <Select
                    options={triggerOptions.map((o) => ({
                      value: o.value,
                      label: o.label,
                    }))}
                    placeholder="Select a field"
                    showSearch
                    optionFilterProp="label"
                  />
                </Form.Item>

                <Form.Item
                  name="visibilityOperator"
                  label="Condition"
                  initialValue="equals"
                  rules={[{ required: true, message: "Select a condition" }]}
                >
                  <Select options={OPERATOR_OPTIONS} />
                </Form.Item>

                {operator === "in" ? (
                  <Form.Item
                    name="visibilityInValues"
                    label="Values"
                    rules={visibilityInValuesRules}
                    extra="Press Enter after each value"
                  >
                    <Select
                      mode="tags"
                      placeholder="Add values and press Enter"
                      tokenSeparators={[","]}
                    />
                  </Form.Item>
                ) : triggerMeta?.fieldType === "CHECKBOX" ? (
                  <Form.Item
                    name="visibilityValue"
                    label="Value"
                    rules={visibilityValueRules}
                  >
                    <Select
                      options={[
                        { value: "true", label: "Yes (true)" },
                        { value: "false", label: "No (false)" },
                      ]}
                    />
                  </Form.Item>
                ) : staticOptions.length > 0 ? (
                  <Form.Item
                    name="visibilityValue"
                    label="Value"
                    rules={visibilityValueRules}
                  >
                    <Select
                      options={staticOptions}
                      placeholder="Select a value"
                      showSearch
                      optionFilterProp="label"
                    />
                  </Form.Item>
                ) : triggerMeta?.fieldType === "NUMBER" ? (
                  <Form.Item
                    name="visibilityValue"
                    label="Value"
                    rules={visibilityValueRules}
                  >
                    <Input type="number" placeholder="Enter a number" />
                  </Form.Item>
                ) : (
                  <Form.Item
                    name="visibilityValue"
                    label="Value"
                    rules={visibilityValueRules}
                  >
                    <Input placeholder="Enter the expected value" />
                  </Form.Item>
                )}
              </>
            );
          }}
        </Form.Item>

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

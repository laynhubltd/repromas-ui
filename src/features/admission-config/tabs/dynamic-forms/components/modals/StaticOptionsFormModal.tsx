import { useToken } from "@/shared/hooks/useToken";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Form, Input, Modal, Typography } from "antd";
import { useStaticOptionsModal } from "../../hooks/useStaticOptionsModal";
import {
  staticOptionLabelRules,
  staticOptionValueRules,
} from "../../utils/validators";

export type StaticOptionsFormModalProps = {
  open: boolean;
  initialJson: string | undefined;
  columnName: string | undefined;
  onClose: () => void;
  onApply: (json: string, enumValues: string[]) => void;
};

export function StaticOptionsFormModal({
  open,
  initialJson,
  columnName,
  onClose,
  onApply,
}: StaticOptionsFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useStaticOptionsModal(
    open,
    initialJson,
    columnName,
    onApply,
    onClose,
  );
  const { handleApply, handleCancel, handleApplyGenderPreset } = actions;

  return (
    <Modal
      title="Static options"
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
      <Typography.Paragraph
        type="secondary"
        style={{ fontSize: token.fontSizeSM, marginBottom: 12 }}
      >
        Define value/label pairs saved on the field. Candidates receive these as
        field.options from render-package.
      </Typography.Paragraph>

      {state.showGenderPreset && (
        <Button
          type="link"
          size="small"
          style={{ padding: 0, marginBottom: 12 }}
          onClick={handleApplyGenderPreset}
        >
          Use gender preset (Male, Female, Other)
        </Button>
      )}

      <Form form={form} layout="vertical" onFinish={handleApply}>
        <Form.List name="rows">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Flex key={key} gap={8} align="start" style={{ marginBottom: 8 }}>
                  <Form.Item
                    {...restField}
                    name={[name, "value"]}
                    label={name === 0 ? "Value" : undefined}
                    rules={staticOptionValueRules}
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    <Input placeholder="e.g. MALE" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "label"]}
                    label={name === 0 ? "Label" : undefined}
                    rules={staticOptionLabelRules}
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    <Input placeholder="e.g. Male" />
                  </Form.Item>
                  <Button
                    type="text"
                    aria-label="Remove option"
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(name)}
                    disabled={fields.length <= 1}
                    style={{ marginTop: name === 0 ? 30 : 0 }}
                  />
                </Flex>
              ))}
              <Button
                type="dashed"
                onClick={() => add({ value: "", label: "" })}
                block
                icon={<PlusOutlined />}
                style={{ marginBottom: 16 }}
              >
                Add option
              </Button>
            </>
          )}
        </Form.List>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Apply
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

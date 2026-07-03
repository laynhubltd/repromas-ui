import { useToken } from "@/shared/hooks/useToken";
import { Button, Form, Input, Modal, Typography } from "antd";
import { useDuplicateMatricNumberFormatModal } from "../../hooks/useMatricNumberFormatModal";
import type { MatricNumberFormat } from "../../types/matric-number-format";
import { duplicateCodeRules } from "../../utils/validators";

type DuplicateMatricNumberFormatModalProps = {
  open: boolean;
  target: MatricNumberFormat | null;
  onClose: () => void;
  onDuplicated: (format: MatricNumberFormat) => void;
};

export function DuplicateMatricNumberFormatModal({
  open,
  target,
  onClose,
  onDuplicated,
}: DuplicateMatricNumberFormatModalProps) {
  const token = useToken();
  const { state, actions, form } = useDuplicateMatricNumberFormatModal(
    target,
    open,
    onClose,
    onDuplicated,
  );
  const { isLoading } = state;
  const { handleSubmit, handleCancel } = actions;

  return (
    <Modal
      title="Duplicate Matric Number Format"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={480}
      destroyOnHidden
      closable
      styles={{
        body: { padding: `${token.paddingSM}px ${token.paddingSM}px` },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <div style={{ padding: 24 }}>
        <Typography.Text style={{ display: "block", marginBottom: 16 }}>
          Create an editable copy of{" "}
          <Typography.Text strong>'{target?.code}'</Typography.Text> as a new draft.
        </Typography.Text>
        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          <Form.Item
            name="code"
            label={
              <span>
                New format code <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={duplicateCodeRules}
          >
            <Input placeholder="e.g. session-reg-v2" style={{ height: 40 }} />
          </Form.Item>
        </Form>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: 24,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
        }}
      >
        <Button
          type="primary"
          loading={isLoading}
          disabled={isLoading}
          onClick={() => form.submit()}
          block
          style={{ height: 48, fontWeight: 600 }}
        >
          Duplicate as Draft
        </Button>
        <Button type="text" block onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

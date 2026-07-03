import { useToken } from "@/shared/hooks/useToken";
import { Button, Form, Input, Modal } from "antd";
import { useCreateMatricNumberFormatModal } from "../../hooks/useMatricNumberFormatModal";
import type { MatricNumberFormat } from "../../types/matric-number-format";
import { formatCodeRules } from "../../utils/validators";

type CreateMatricNumberFormatModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (format: MatricNumberFormat) => void;
};

export function CreateMatricNumberFormatModal({
  open,
  onClose,
  onCreated,
}: CreateMatricNumberFormatModalProps) {
  const token = useToken();
  const { state, actions, form } = useCreateMatricNumberFormatModal(open, onClose, onCreated);
  const { isLoading } = state;
  const { handleSubmit, handleCancel } = actions;

  return (
    <Modal
      title="Create Matric Number Format"
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
        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          <Form.Item
            name="code"
            label={
              <span>
                Format code <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={formatCodeRules}
            extra="Admin label for this format version (unique per tenant)."
          >
            <Input placeholder="e.g. session-reg" style={{ height: 40 }} />
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
          Create Draft
        </Button>
        <Button type="text" block onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

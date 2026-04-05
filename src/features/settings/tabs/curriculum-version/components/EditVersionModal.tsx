import { useToken } from "@/shared/hooks/useToken";
import { Alert, Button, Form, Input, Modal } from "antd";
import { useEditVersionModal } from "../hooks/useEditVersionModal";
import type { CurriculumVersion } from "../types/curriculum-version";

interface EditVersionModalProps {
  open: boolean;
  target: CurriculumVersion | null;
  onClose: () => void;
}

export function EditVersionModal({ open, target, onClose }: EditVersionModalProps) {
  const token = useToken();
  const { state, actions, form } = useEditVersionModal(target, open, onClose);
  const { formError, isLoading } = state;
  const { handleSubmit, handleCancel } = actions;

  return (
    <Modal
      title="Edit Curriculum Version"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={480}
      destroyOnClose
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
        {formError && (
          <Alert type="error" message={formError} style={{ marginBottom: 16 }} showIcon />
        )}
        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label={
              <span>
                Name <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Please enter a version name" }]}
            style={{ marginBottom: 0 }}
          >
            <Input placeholder="e.g. 2026 CCMAS Standard" style={{ height: 40 }} />
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
          Save Changes
        </Button>
        <Button
          type="text"
          block
          onClick={handleCancel}
          disabled={isLoading}
          style={{ height: 40, color: token.colorTextSecondary, fontWeight: 500, fontSize: token.fontSizeSM }}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

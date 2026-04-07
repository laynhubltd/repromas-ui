import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, DatePicker, Form, Input, Modal, Switch } from "antd";
import { useSessionFormModal } from "../../hooks/useSessionModal";
import type { AcademicSession } from "../../types/academic-calendar";
import { sessionEndDateRules, sessionNameRules } from "../../utils/validators";

export type SessionFormModalProps = {
  open: boolean;
  target: AcademicSession | null;
  onClose: () => void;
};

export function SessionFormModal({ open, target, onClose }: SessionFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useSessionFormModal(target, open, onClose);
  const { formError, isLoading, isEditMode } = state;
  const { handleSubmit, handleCancel } = actions;

  return (
    <Modal
      title={isEditMode ? "Edit Session" : "Create Session"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width="100%"
      style={{ maxWidth: 480 }}
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
        <ErrorAlert variant="form" error={formError} />

        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          <Form.Item name="name" label="Name" rules={sessionNameRules}>
            <Input placeholder="e.g. 2025/2026" style={{ height: 40 }} />
          </Form.Item>

          <Form.Item name="startDate" label="Start Date">
            <DatePicker style={{ width: "100%", height: 40 }} />
          </Form.Item>

          <Form.Item name="endDate" label="End Date" rules={sessionEndDateRules}>
            <DatePicker style={{ width: "100%", height: 40 }} />
          </Form.Item>

          {isEditMode && (
            <Form.Item name="isCurrent" label="Set as Current" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
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
          {isEditMode ? "Save Changes" : "Create Session"}
        </Button>
        <Button
          type="text"
          block
          onClick={handleCancel}
          disabled={isLoading}
          style={{
            height: 40,
            color: token.colorTextSecondary,
            fontWeight: 500,
            fontSize: token.fontSizeSM,
          }}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

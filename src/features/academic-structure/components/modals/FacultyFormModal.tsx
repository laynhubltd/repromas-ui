// Feature: faculty-department-management
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Form, Input, Modal } from "antd";
import { useFacultyFormModal } from "../../hooks/useFacultyModal";
import type { Faculty } from "../../types/faculty";
import { codeRule, nameRule } from "../../utils/validators";

export type FacultyFormModalProps = {
  open: boolean;
  /** null = create mode, Faculty = edit mode */
  target: Faculty | null;
  onClose: () => void;
};

export function FacultyFormModal({ open, target, onClose }: FacultyFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useFacultyFormModal(target, open, onClose);
  const { formError, isLoading, isEditMode } = state;
  const { handleSubmit, handleCancel } = actions;

  return (
    <Modal
      title={isEditMode ? "Edit Faculty" : "Create Faculty"}
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
        <ErrorAlert error={formError} />
        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label={
              <span>
                Name <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={nameRule("Please enter a faculty name")}
          >
            <Input placeholder="e.g. Faculty of Science" style={{ height: 40 }} />
          </Form.Item>
          <Form.Item
            name="code"
            label={
              <span>
                Code <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={codeRule("Please enter a faculty code")}
            style={{ marginBottom: 0 }}
          >
            <Input placeholder="e.g. SCI" style={{ height: 40 }} />
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
          {isEditMode ? "Save Changes" : "Create Faculty"}
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

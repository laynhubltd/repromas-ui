// Feature: faculty-department-management
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Form, Input, Modal, Select } from "antd";
import { useDepartmentFormModal } from "../../hooks/useDepartmentModal";
import type { Department } from "../../types/faculty";
import { codeRule, nameRule } from "../../utils/validators";

export type DepartmentFormModalProps = {
  open: boolean;
  /** null = create mode, Department = edit mode */
  target: Department | null;
  onClose: () => void;
  /** Required in create mode — the parent faculty context */
  facultyId?: number;
  facultyName?: string;
};

export function DepartmentFormModal({
  open,
  target,
  onClose,
  facultyId,
  facultyName,
}: DepartmentFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useDepartmentFormModal(target, open, onClose, { facultyId });
  const { formError, isLoading, isEditMode, faculties, facultiesLoading, showFacultySelector } =
    state;
  const { handleSubmit, handleCancel } = actions;

  const title = isEditMode
    ? "Edit Department"
    : `Add Department${facultyName ? ` to ${facultyName}` : ""}`;

  return (
    <Modal
      title={title}
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
          {showFacultySelector && (
            <Form.Item
              name="facultyId"
              label={
                <span>
                  Faculty <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select a faculty" }]}
            >
              <Select
                placeholder="Select a faculty"
                loading={facultiesLoading}
                style={{ height: 40 }}
                options={faculties.map((f) => ({ value: f.id, label: f.name }))}
              />
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label={
              <span>
                Name <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={nameRule("Please enter a department name")}
          >
            <Input placeholder="e.g. Department of Computer Science" style={{ height: 40 }} />
          </Form.Item>
          <Form.Item
            name="code"
            label={
              <span>
                Code <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={codeRule("Please enter a department code")}
            style={{ marginBottom: 0 }}
          >
            <Input placeholder="e.g. CS" style={{ height: 40 }} />
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
          {isEditMode ? "Save Changes" : "Add Department"}
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

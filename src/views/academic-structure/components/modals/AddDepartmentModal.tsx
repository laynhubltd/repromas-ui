import { useToken } from "@/hooks/useToken";
import { LockOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal } from "antd";
import { useIsMobile } from "@/hooks/useBreakpoint";

export interface AddDepartmentFormValues {
  code: string;
  name: string;
}

export interface AddDepartmentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AddDepartmentFormValues) => void | Promise<void>;
  /** Faculty under which the department will be added (shown as read-only target). */
  faculty: { id: number; name: string; code: string };
  loading?: boolean;
}

export function AddDepartmentModal({
  open,
  onClose,
  onSubmit,
  faculty,
  loading = false,
}: AddDepartmentModalProps) {
  const [form] = Form.useForm<AddDepartmentFormValues>();
  const token = useToken();
  const isMobile = useIsMobile();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
      onClose();
    } catch {
      // validation or submit error
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const targetFacultyDisplay = `${faculty.name} (${faculty.code})`;

  return (
    <Modal
      title="Add New Department"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={isMobile ? "100%" : 520}
      style={isMobile ? { maxWidth: "100%", top: 16, paddingBottom: 0 } : undefined}
      destroyOnClose
      styles={{
        body: { paddingTop: 8, padding: isMobile ? 16 : 24 },
        header: { borderBottom: `1px solid ${token.colorBorderSecondary}` },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleOk}
        style={{ marginBottom: 24 }}
      >
        <Form.Item
          label={
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: token.colorTextSecondary,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Target Faculty
            </span>
          }
        >
          <Input
            value={targetFacultyDisplay}
            disabled
            suffix={<LockOutlined style={{ color: token.colorTextTertiary, fontSize: 14 }} />}
            style={{
              color: token.colorTextSecondary,
              cursor: "not-allowed",
            }}
          />
          <div
            style={{
              fontSize: 10,
              color: token.colorTextTertiary,
              marginTop: 4,
            }}
          >
            The department will be added under this academic division.
          </div>
        </Form.Item>

        <Form.Item
          name="code"
          label={
            <span>
              Department code <span style={{ color: token.colorError }}>*</span>
            </span>
          }
          extra={
            <span style={{ fontSize: 10, color: token.colorTextTertiary }}>
              Short identifier for the department (max 5 characters).
            </span>
          }
          rules={[
            { required: true, message: "Please enter department code" },
            { max: 5, message: "Max 5 characters" },
          ]}
        >
          <Input placeholder="e.g., CS" maxLength={5} showCount={false} />
        </Form.Item>

        <Form.Item
          name="name"
          label={
            <span>
              Department name <span style={{ color: token.colorError }}>*</span>
            </span>
          }
          rules={[{ required: true, message: "Please enter department name" }]}
        >
          <Input placeholder="e.g., Department of Computer Science" />
        </Form.Item>
      </Form>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          paddingTop: 16,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
          margin: isMobile ? "0 -16px -16px" : "0 -24px -24px",
          padding: isMobile ? "16px" : "16px 24px 24px",
        }}
      >
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="primary" loading={loading} onClick={() => form.submit()}>
          Create Department
        </Button>
      </div>
    </Modal>
  );
}

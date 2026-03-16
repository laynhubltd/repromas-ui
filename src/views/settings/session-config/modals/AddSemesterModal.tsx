import { useToken } from "@/hooks/useToken";
import { Button, Form, Input, Modal, Select } from "antd";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { CloseOutlined } from "@ant-design/icons";
import type { SemesterStatus } from "../../types";

const STATUS_OPTIONS: { value: SemesterStatus; label: string }[] = [
  { value: "OPEN", label: "OPEN" },
  { value: "CLOSED", label: "CLOSED" },
  { value: "GRADING", label: "GRADING" },
];

export interface AddSemesterFormValues {
  name: string;
  status: SemesterStatus;
}

export interface AddSemesterModalProps {
  open: boolean;
  onClose: () => void;
  sessionId: number | null;
  sessionName: string;
  onSubmit: (values: {
    sessionId: number;
    name: string;
    status: SemesterStatus;
  }) => void | Promise<void>;
  loading?: boolean;
}

const labelStyle = {
  display: "block" as const,
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  marginBottom: 8,
  color: undefined as string | undefined,
};

export function AddSemesterModal({
  open,
  onClose,
  sessionId,
  sessionName,
  onSubmit,
  loading = false,
}: AddSemesterModalProps) {
  const [form] = Form.useForm<AddSemesterFormValues>();
  const token = useToken();
  const isMobile = useIsMobile();

  const handleOk = async () => {
    if (sessionId == null) return;
    try {
      const values = await form.validateFields();
      await onSubmit({
        sessionId,
        name: values.name.trim(),
        status: values.status,
      });
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

  const formLabelStyle = {
    ...labelStyle,
    color: token.colorTextSecondary,
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={isMobile ? "100%" : 500}
      style={
        isMobile
          ? { maxWidth: "100%", top: 16, paddingBottom: 0 }
          : undefined
      }
      destroyOnClose
      styles={{
        content: {
          padding: 0,
          borderRadius: token.borderRadius,
          border: "none",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        },
        wrapper: {
          backdropFilter: "blur(2px)",
        },
      }}
      maskStyle={{ backgroundColor: "rgba(15, 23, 42, 0.6)" }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 24,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: token.colorText,
          }}
        >
          Add New Semester
        </h3>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={handleCancel}
          style={{
            color: token.colorTextSecondary,
            width: 32,
            height: 32,
          }}
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleOk}
        style={{ padding: 24 }}
      >
        {/* Academic Session (read-only) */}
        <div style={{ marginBottom: 20 }}>
          <label style={formLabelStyle}>Academic Session</label>
          <Input
            value={sessionName}
            disabled
            style={{
              height: 48,
              background: token.colorBgLayout,
              color: token.colorTextSecondary,
              cursor: "not-allowed",
            }}
          />
        </div>

        <Form.Item
          name="name"
          label={
            <span style={formLabelStyle}>
              Semester name <span style={{ color: token.colorError }}>*</span>
            </span>
          }
          rules={[{ required: true, message: "Please enter semester name" }]}
          style={{ marginBottom: 20 }}
        >
          <Input
            placeholder="e.g. First Semester"
            style={{ height: 48 }}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label={
            <span style={formLabelStyle}>
              Status <span style={{ color: token.colorError }}>*</span>
            </span>
          }
          rules={[{ required: true, message: "Please select status" }]}
          style={{ marginBottom: 0 }}
        >
          <Select
            placeholder="Select status"
            options={STATUS_OPTIONS}
            size="large"
            style={{ width: "100%" }}
            getPopupContainer={(node) => node.parentElement ?? document.body}
          />
        </Form.Item>
      </Form>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 12,
          padding: 24,
          background: token.colorBgLayout,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Button
          onClick={handleCancel}
          disabled={loading}
          style={{
            fontWeight: 500,
            color: token.colorTextSecondary,
          }}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
          style={{
            height: 48,
            paddingLeft: 32,
            paddingRight: 32,
            fontWeight: 700,
          }}
        >
          Create Semester
        </Button>
      </div>
    </Modal>
  );
}

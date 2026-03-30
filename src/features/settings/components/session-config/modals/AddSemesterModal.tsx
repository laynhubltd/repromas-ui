import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import type { SemesterStatus } from "@/shared/types/settings-types";
import { CloseOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select } from "antd";

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

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={isMobile ? "100%" : 500}
      destroyOnClose
      title={null}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 24,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <h3 style={{ margin: 0 }}>Add New Semester</h3>
        <Button type="text" icon={<CloseOutlined />} onClick={handleCancel} />
      </div>

      <Form form={form} layout="vertical" requiredMark={false} onFinish={handleOk} style={{ padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <label>Academic Session</label>
          <Input value={sessionName} disabled />
        </div>

        <Form.Item
          name="name"
          label="Semester name"
          rules={[{ required: true, message: "Please enter semester name" }]}
        >
          <Input placeholder="e.g. First Semester" />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: "Please select status" }]}
        >
          <Select options={STATUS_OPTIONS} />
        </Form.Item>
      </Form>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          padding: 24,
          background: token.colorBgLayout,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="primary" loading={loading} onClick={() => form.submit()}>
          Create Semester
        </Button>
      </div>
    </Modal>
  );
}

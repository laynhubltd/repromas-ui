import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import { Button, Form, Input, InputNumber, Modal } from "antd";

export interface AddProgramFormValues {
  name: string;
  degreeTitle: string;
  durationInYears: number;
  utmeMinimumTotalUnit: number;
  deMinimumTotalUnit: number;
}

export interface AddProgramModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AddProgramFormValues) => void | Promise<void>;
  /** Department under which the program will be added (shown as read-only). */
  department: { id: number; name: string; code: string };
  loading?: boolean;
}

export function AddProgramModal({
  open,
  onClose,
  onSubmit,
  department,
  loading = false,
}: AddProgramModalProps) {
  const [form] = Form.useForm<AddProgramFormValues>();
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

  return (
    <Modal
      title="Add New Program"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={isMobile ? "100%" : 576}
      style={isMobile ? { maxWidth: "100%", top: 16, paddingBottom: 0 } : undefined}
      destroyOnHidden
      styles={{
        body: { paddingTop: 8, padding: isMobile ? 16 : 32 },
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
                fontSize: 12,
                fontWeight: 500,
                color: token.colorText,
              }}
            >
              Adding to Department
            </span>
          }
        >
          <Input
            value={department.name}
            disabled
            style={{
              color: token.colorTextSecondary,
              cursor: "not-allowed",
            }}
          />
        </Form.Item>

        <Form.Item
          name="name"
          label={
            <span>
              Program name <span style={{ color: token.colorError }}>*</span>
            </span>
          }
          extra={
            <span style={{ fontSize: 10, color: token.colorTextTertiary, fontStyle: "italic" }}>
              Enter the full name of the academic program.
            </span>
          }
          rules={[{ required: true, message: "Please enter program name" }]}
        >
          <Input placeholder="e.g., Computer Science" />
        </Form.Item>

        <Form.Item
          name="degreeTitle"
          label={
            <span>
              Degree title <span style={{ color: token.colorError }}>*</span>
            </span>
          }
          extra={
            <span style={{ fontSize: 10, color: token.colorTextTertiary, fontStyle: "italic" }}>
              Example: B.Sc., B.Eng., B.A. followed by the discipline.
            </span>
          }
          rules={[{ required: true, message: "Please enter degree title" }]}
        >
          <Input placeholder="e.g., B.Sc. Computer Science" />
        </Form.Item>

        <Form.Item
          name="durationInYears"
          label={
            <span>
              Duration (years) <span style={{ color: token.colorError }}>*</span>
            </span>
          }
          rules={[
            { required: true, message: "Please enter duration" },
            { type: "number", min: 1, message: "Must be at least 1 year" },
          ]}
        >
          <InputNumber
            placeholder="e.g., 4"
            min={1}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          name="utmeMinimumTotalUnit"
          label={
            <span>
              UTME minimum total units <span style={{ color: token.colorError }}>*</span>
            </span>
          }
          extra={
            <span style={{ fontSize: 10, color: token.colorTextTertiary, fontStyle: "italic" }}>
              For a student to graduate, they must pass this minimum total of units (UTME entry).
            </span>
          }
          rules={[
            { required: true, message: "Please enter UTME minimum units" },
            { type: "number", min: 0, message: "Must be 0 or more" },
          ]}
        >
          <InputNumber
            placeholder="e.g., 180"
            min={0}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          name="deMinimumTotalUnit"
          label={
            <span>
              DE minimum total units <span style={{ color: token.colorError }}>*</span>
            </span>
          }
          extra={
            <span style={{ fontSize: 10, color: token.colorTextTertiary, fontStyle: "italic" }}>
              For a student to graduate, they must pass this minimum total of units (Direct Entry).
            </span>
          }
          rules={[
            { required: true, message: "Please enter DE minimum units" },
            { type: "number", min: 0, message: "Must be 0 or more" },
          ]}
        >
          <InputNumber
            placeholder="e.g., 120"
            min={0}
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Form>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          paddingTop: 24,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
          margin: isMobile ? "0 -16px -16px" : "0 -32px -32px",
          padding: isMobile ? "16px" : "24px 32px 32px",
        }}
      >
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="primary" loading={loading} onClick={() => form.submit()}>
          Create Program
        </Button>
      </div>
    </Modal>
  );
}

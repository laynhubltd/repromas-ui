import { useToken } from "@/hooks/useToken";
import { Button, Form, Input, Modal } from "antd";
import { useIsMobile } from "@/hooks/useBreakpoint";

export interface AddSemesterTypeFormValues {
  name: string;
}

export interface AddSemesterTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AddSemesterTypeFormValues) => void | Promise<void>;
  loading?: boolean;
}

export function AddSemesterTypeModal({
  open,
  onClose,
  onSubmit,
  loading = false,
}: AddSemesterTypeModalProps) {
  const [form] = Form.useForm<AddSemesterTypeFormValues>();
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
      title="Add Semester Type"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={isMobile ? "100%" : 440}
      style={
        isMobile
          ? { maxWidth: "100%", top: 16, paddingBottom: 0 }
          : undefined
      }
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
          name="name"
          label={
            <span>
              Semester type name{" "}
              <span style={{ color: token.colorError }}>*</span>
            </span>
          }
          rules={[
            { required: true, message: "Please enter semester type name" },
          ]}
        >
          <Input placeholder="e.g., First Semester" />
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
          Create
        </Button>
      </div>
    </Modal>
  );
}

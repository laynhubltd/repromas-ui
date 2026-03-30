import { useToken } from "@/shared/hooks/useToken";
import { Button, Form, Input, InputNumber, Modal } from "antd";
import { useIsMobile } from "@/hooks/useBreakpoint";

export interface AddLevelFormValues {
  name: string;
  rankOrder: number;
  description?: string;
}

export interface AddLevelModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    rankOrder: number;
    description?: string | null;
  }) => void | Promise<void>;
  loading?: boolean;
}

export function AddLevelModal({
  open,
  onClose,
  onSubmit,
  loading = false,
}: AddLevelModalProps) {
  const [form] = Form.useForm<AddLevelFormValues>();
  const token = useToken();
  const isMobile = useIsMobile();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit({
        name: values.name.trim(),
        rankOrder: values.rankOrder,
        description: values.description?.trim() || null,
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
      title="Add Level"
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
        initialValues={{ rankOrder: 100 }}
        style={{ marginBottom: 24 }}
      >
        <Form.Item
          name="name"
          label={
            <span>
              Level name <span style={{ color: token.colorError }}>*</span>
            </span>
          }
          rules={[{ required: true, message: "Please enter level name" }]}
        >
          <Input placeholder="e.g., 100 Level" />
        </Form.Item>
        <Form.Item
          name="rankOrder"
          label={
            <span>
              Rank order <span style={{ color: token.colorError }}>*</span>
            </span>
          }
          rules={[{ required: true, message: "Please enter rank order" }]}
        >
          <InputNumber
            min={1}
            max={9999}
            style={{ width: "100%" }}
            placeholder="e.g., 100"
          />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea
            rows={2}
            placeholder="Optional short description"
            maxLength={255}
            showCount
          />
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
          Create Level
        </Button>
      </div>
    </Modal>
  );
}

import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import { Button, DatePicker, Form, Input, Modal, Switch } from "antd";
import type { Dayjs } from "dayjs";

export interface AddSessionFormValues {
  name: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  isCurrent: boolean;
}

export interface AddSessionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  }) => void | Promise<void>;
  loading?: boolean;
}

export function AddSessionModal({
  open,
  onClose,
  onSubmit,
  loading = false,
}: AddSessionModalProps) {
  const [form] = Form.useForm<AddSessionFormValues>();
  const token = useToken();
  const isMobile = useIsMobile();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const startDate = values.startDate?.format("YYYY-MM-DD") ?? "";
      const endDate = values.endDate?.format("YYYY-MM-DD") ?? "";
      await onSubmit({
        name: values.name.trim(),
        startDate,
        endDate,
        isCurrent: values.isCurrent ?? false,
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
      title="Add New Session"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={isMobile ? "100%" : 480}
      style={
        isMobile ? { maxWidth: "100%", top: 16, paddingBottom: 0 } : undefined
      }
      destroyOnClose
      closable
      styles={{
        body: {
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
        },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
      maskStyle={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      {/* Body */}
      <div style={{ padding: 24 }}>
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleOk}
          initialValues={{ isCurrent: false }}
        >
          <Form.Item
            name="name"
            label={
              <span>
                Session Name{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={[{ required: true, message: "Please enter session name" }]}
            style={{ marginBottom: 20 }}
          >
            <Input
              placeholder="e.g. 2024/2025 Academic Session"
              style={{ height: 40 }}
            />
          </Form.Item>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <Form.Item
              name="startDate"
              label={
                <span>
                  Start Date{" "}
                  <span style={{ color: token.colorError, fontWeight: 700 }}>
                    *
                  </span>
                </span>
              }
              rules={[{ required: true, message: "Required" }]}
              style={{ marginBottom: 0 }}
            >
              <DatePicker
                style={{ width: "100%", height: 40 }}
                format="YYYY-MM-DD"
              />
            </Form.Item>
            <Form.Item
              name="endDate"
              label={
                <span>
                  End Date{" "}
                  <span style={{ color: token.colorError, fontWeight: 700 }}>
                    *
                  </span>
                </span>
              }
              rules={[{ required: true, message: "Required" }]}
              style={{ marginBottom: 0 }}
            >
              <DatePicker
                style={{ width: "100%", height: 40 }}
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </div>

          <div style={{ paddingTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Form.Item
                name="isCurrent"
                valuePropName="checked"
                style={{ marginBottom: 0 }}
                noStyle
              >
                <Switch />
              </Form.Item>
              <span
                style={{
                  fontSize: token.fontSizeSM,
                  fontWeight: 500,
                  color: token.colorText,
                }}
              >
                Set as Current Session
              </span>
            </div>
          </div>
        </Form>
      </div>

      {/* Footer */}
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
          loading={loading}
          onClick={() => form.submit()}
          block
          style={{
            height: 48,
            fontWeight: 600,
          }}
        >
          Create Session
        </Button>
        <Button
          type="text"
          block
          onClick={handleCancel}
          disabled={loading}
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

import { useToken } from "@/shared/hooks/useToken";
import { Button, Form, Input, Modal, Radio, Select, Space, Typography } from "antd";
import { useCreateVersionModal } from "../hooks/useCreateVersionModal";

interface CreateVersionModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateVersionModal({ open, onClose }: CreateVersionModalProps) {
  const token = useToken();
  const { state, actions, form } = useCreateVersionModal(open, onClose);
  const { isLoading, isProgramsLoading, programs } = state;
  const { handleSubmit, handleCancel } = actions;

  const scope = Form.useWatch("scope", form) ?? "GLOBAL";

  return (
    <Modal
      title="Create Curriculum Version"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={520}
      destroyOnClose
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
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{ scope: "GLOBAL" }}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="scope"
            label={
              <span>
                Scope <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Please select a scope" }]}
          >
            <Radio.Group style={{ width: "100%" }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Radio value="GLOBAL">
                  <Space orientation="vertical" size={0}>
                    <Typography.Text strong>Global Standard (Institution-wide)</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                      Baseline handbook or regulatory benchmark applying to all programs.
                    </Typography.Text>
                  </Space>
                </Radio>
                <Radio value="PROGRAM">
                  <Space orientation="vertical" size={0}>
                    <Typography.Text strong>Program Specific</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                      Custom curriculum standard tailored to a single degree program.
                    </Typography.Text>
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          {scope === "PROGRAM" && (
            <Form.Item
              name="referenceId"
              label={
                <span>
                  Target Program <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select a program" }]}
            >
              <Select
                placeholder="Search and select program"
                loading={isProgramsLoading}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                style={{ height: 40 }}
                options={programs.map((p) => ({
                  value: p.id,
                  label: p.code ? `${p.name} (${p.code})` : p.name,
                }))}
              />
            </Form.Item>
          )}

          <Form.Item
            name="name"
            label={
              <span>
                Version Name <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Please enter a version name" }]}
            style={{ marginBottom: 0 }}
          >
            <Input
              placeholder={
                scope === "GLOBAL"
                  ? "e.g. 2026 CCMAS Standard"
                  : "e.g. 2026 Software Engineering Special Standard"
              }
              style={{ height: 40 }}
            />
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
          Create Version
        </Button>
        <Button
          type="text"
          block
          onClick={handleCancel}
          disabled={isLoading}
          style={{ height: 40, color: token.colorTextSecondary, fontWeight: 500, fontSize: token.fontSizeSM }}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}


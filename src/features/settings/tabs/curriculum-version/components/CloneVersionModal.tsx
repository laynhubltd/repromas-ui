import { useToken } from "@/shared/hooks/useToken";
import { CopyOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Flex,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Typography,
} from "antd";
import { useCloneVersionModal } from "../hooks/useCloneVersionModal";
import type { CurriculumVersion } from "../types/curriculum-version";

interface CloneVersionModalProps {
  open: boolean;
  target: CurriculumVersion | null;
  onClose: () => void;
}

export function CloneVersionModal({ open, target, onClose }: CloneVersionModalProps) {
  const token = useToken();
  const { state, actions, form } = useCloneVersionModal(open, target, onClose);
  const { isLoading, isProgramsLoading, programs } = state;
  const { handleSubmit, handleCancel } = actions;

  const scope = Form.useWatch("scope", form) ?? "PROGRAM";

  return (
    <Modal
      title={
        <Flex align="center" gap={8}>
          <CopyOutlined style={{ color: token.colorPrimary }} />
          <span>Branch / Clone Curriculum Version</span>
        </Flex>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={540}
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
        {/* Source version info box */}
        {target && (
          <div
            style={{
              padding: "12px 16px",
              background: token.colorBgLayout,
              borderRadius: token.borderRadiusSM,
              border: `1px solid ${token.colorBorderSecondary}`,
              marginBottom: 20,
            }}
          >
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM, display: "block" }}>
              Source Version
            </Typography.Text>
            <Typography.Text strong style={{ fontSize: token.fontSize }}>
              {target.name}
            </Typography.Text>
            <div style={{ marginTop: 4 }}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Scope: {target.scope === "PROGRAM" ? `Program (${target.program?.name ?? target.referenceId})` : "Global Baseline"}
              </Typography.Text>
            </div>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label={
              <span>
                New Version Name <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Please enter a version name" }]}
          >
            <Input placeholder="e.g. 2026 Software Engineering Custom Standard" style={{ height: 40 }} />
          </Form.Item>

          <Form.Item
            name="scope"
            label={
              <span>
                Target Scope <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Please select a target scope" }]}
          >
            <Radio.Group style={{ width: "100%" }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Radio value="PROGRAM">
                  <Space orientation="vertical" size={0}>
                    <Typography.Text strong>Program Specific (Recommended)</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                      Branch this version for a single degree program.
                    </Typography.Text>
                  </Space>
                </Radio>
                <Radio value="GLOBAL">
                  <Space orientation="vertical" size={0}>
                    <Typography.Text strong>Global Standard</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                      Create a new baseline standard applying across all programs.
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

          <div
            style={{
              marginTop: 16,
              padding: "12px 16px",
              background: token.colorBgContainer,
              border: `1px dashed ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusSM,
            }}
          >
            <Typography.Text strong style={{ display: "block", marginBottom: 8, fontSize: token.fontSizeSM }}>
              Branching Options
            </Typography.Text>
            <Space orientation="vertical" size={8}>
              <Form.Item name="copyCourseConfigurations" valuePropName="checked" noStyle>
                <Checkbox>
                  <Typography.Text style={{ fontSize: token.fontSizeSM }}>
                    Duplicate Course Configurations into new version
                  </Typography.Text>
                </Checkbox>
              </Form.Item>
              <Form.Item name="copyGraduationRequirements" valuePropName="checked" noStyle>
                <Checkbox>
                  <Typography.Text style={{ fontSize: token.fontSizeSM }}>
                    Duplicate Graduation Requirements into new version
                  </Typography.Text>
                </Checkbox>
              </Form.Item>
            </Space>
          </div>
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
          Branch / Clone Version
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

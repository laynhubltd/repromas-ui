// Feature: level-config
import { useToken } from "@/shared/hooks/useToken";
import { Button, Form, Input, InputNumber, Modal } from "antd";
import { useLevelCategoryFormModal } from "../../hooks/useLevelCategoryModal";
import type { LevelCategory } from "../../types/levelCategory";
import {
    descriptionRules,
    nameRules,
} from "../../utils/validators";

export type LevelCategoryFormModalProps = {
  open: boolean;
  /** null = create mode, LevelCategory = edit mode */
  target: LevelCategory | null;
  onClose: () => void;
};

export function LevelCategoryFormModal({ open, target, onClose }: LevelCategoryFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useLevelCategoryFormModal(target, open, onClose);
  const { isLoading, isEditMode } = state;
  const { handleSubmit, handleCancel } = actions;

  return (
    <Modal
      title={isEditMode ? "Edit Level Category" : "Create Level Category"}
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
        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label={
              <span>
                Name <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={nameRules}
          >
            <Input placeholder="e.g. National Diploma" style={{ height: 40 }} />
          </Form.Item>

          <Form.Item
            name="code"
            label={
              <span>
                Code <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={[
                { required: true, message: "Code is required" },
                { max: 20, message: "Code cannot exceed 20 characters" }
            ]}
          >
            <Input placeholder="e.g. ND" style={{ height: 40 }} />
          </Form.Item>

          <Form.Item
            name="semestersPerLevel"
            label="Semesters Per Level"
          >
            <InputNumber
              min={1}
              style={{ width: "100%", height: 40 }}
              placeholder="e.g. 2"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={descriptionRules}
            style={{ marginBottom: 0 }}
          >
            <Input.TextArea
              rows={3}
              placeholder="Optional description"
              maxLength={255}
              showCount
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
          {isEditMode ? "Save Changes" : "Create Category"}
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

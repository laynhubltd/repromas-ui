// Feature: level-config
import { useToken } from "@/shared/hooks/useToken";
import { Button, Form, Input, InputNumber, Modal, Select } from "antd";
import { useEffect } from "react";
import { useLevelFormModal } from "../../hooks/useLevelModal";
import type { Level } from "../../types/level";
import type { LevelCategory } from "../../types/levelCategory";
import {
    descriptionRules,
    nameRules,
    rankOrderRules,
} from "../../utils/validators";

export type LevelFormModalProps = {
  open: boolean;
  /** null = create mode, Level = edit mode */
  target: Level | null;
  onClose: () => void;
  hasLevelCategory?: boolean;
  selectedCategoryId?: number | null;
  categories?: LevelCategory[];
};

export function LevelFormModal({ 
  open, 
  target, 
  onClose,
  hasLevelCategory,
  selectedCategoryId,
  categories = []
}: LevelFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useLevelFormModal(target, open, onClose);
  const { isLoading, isEditMode } = state;
  const { handleSubmit, handleCancel } = actions;

  // Pre-select categoryId for create mode if one is selected in the UI
  useEffect(() => {
    if (open && !isEditMode && hasLevelCategory && selectedCategoryId) {
      form.setFieldsValue({ categoryId: selectedCategoryId });
    }
  }, [open, isEditMode, hasLevelCategory, selectedCategoryId, form]);

  return (
    <Modal
      title={isEditMode ? "Edit Level" : "Create Level"}
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
          {hasLevelCategory && (
            <Form.Item
              name="categoryId"
              label={
                <span>
                  Level Category <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Level category is required" }]}
            >
              <Select
                placeholder="Select a category"
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                style={{ height: 40 }}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          )}

          <Form.Item
            name="name"
            label={
              <span>
                Name <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={nameRules}
          >
            <Input placeholder="e.g. 100 Level" style={{ height: 40 }} />
          </Form.Item>

          <Form.Item
            name="rankOrder"
            label={
              <span>
                Rank Order <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={rankOrderRules}
          >
            <InputNumber
              min={1}
              style={{ width: "100%", height: 40 }}
              placeholder="e.g. 1"
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
          {isEditMode ? "Save Changes" : "Create Level"}
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

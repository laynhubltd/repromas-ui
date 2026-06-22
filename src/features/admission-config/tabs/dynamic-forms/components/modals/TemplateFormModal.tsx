import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { FORM_PURPOSE_OPTIONS } from "@/shared/constants/dynamicFormOptions";
import { useToken } from "@/shared/hooks/useToken";
import { Button, Form, Input, Modal, Select } from "antd";
import { useDynamicFormTemplateModal } from "../../hooks/useDynamicFormTemplateModal";
import type { FormTemplate } from "@/features/dynamic-form/types";
import {
  templateCodeRules,
  templateNameRules,
} from "../../utils/validators";

export type TemplateFormModalProps = {
  open: boolean;
  target: FormTemplate | null;
  onClose: () => void;
};

export function TemplateFormModal({ open, target, onClose }: TemplateFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useDynamicFormTemplateModal(target, open, onClose);
  const { isLoading, isEditMode } = state;
  const { handleSubmit, handleCancel } = actions;

  return (
    <Modal
      title={isEditMode ? "Edit Form Template" : "Create Form Template"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={560}
      destroyOnHidden
      styles={{
        body: { padding: `${token.paddingSM}px ${token.paddingSM}px` },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {!isEditMode && (
          <Form.Item name="code" label="Code" rules={templateCodeRules}>
            <Input placeholder="undergrad-admission-application" />
          </Form.Item>
        )}
        <Form.Item name="name" label="Name" rules={templateNameRules}>
          <Input placeholder="Undergraduate Admission Application" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Optional description" />
        </Form.Item>
        {!isEditMode && (
          <Form.Item
            name="purpose"
            label="Purpose"
            rules={[{ required: true, message: "Purpose is required" }]}
          >
            <Select
              options={FORM_PURPOSE_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
                disabled: o.disabled,
              }))}
            />
          </Form.Item>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={handleCancel}>Cancel</Button>
          <PermissionGuard
            permission={
              isEditMode
                ? Permission.DynamicFormsUpdate
                : Permission.DynamicFormsCreate
            }
          >
            <Button type="primary" htmlType="submit" loading={isLoading}>
              {isEditMode ? "Save" : "Create"}
            </Button>
          </PermissionGuard>
        </div>
      </Form>
    </Modal>
  );
}

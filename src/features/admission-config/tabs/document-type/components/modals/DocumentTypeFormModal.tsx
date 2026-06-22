import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { COMMON_MIME_TYPE_OPTIONS } from "@/shared/constants/documentTypeOptions";
import { useToken } from "@/shared/hooks/useToken";
import { Button, Form, Input, InputNumber, Modal, Select, Switch, Typography } from "antd";
import { useDocumentTypeFormModal } from "../../hooks/useDocumentTypeModal";
import type { AdmissionDocumentType } from "../../types/document-type";
import {
  codeRules,
  descriptionRules,
  maxSizeMbRules,
  mimeTypesRules,
  nameRules,
} from "../../utils/validators";

type DocumentTypeFormModalProps = {
  open: boolean;
  target: AdmissionDocumentType | null;
  onClose: () => void;
};

export function DocumentTypeFormModal({
  open,
  target,
  onClose,
}: DocumentTypeFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useDocumentTypeFormModal(target, open, onClose);
  const { isEditMode, isSubmitting } = state;
  const { handleSubmit, handleCancel, handleNameChange } = actions;

  return (
    <Modal
      open={open}
      title={isEditMode ? "Edit Document Type" : "Create Document Type"}
      onCancel={handleCancel}
      width={560}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>,
        <PermissionGuard
          key="submit"
          permission={
            isEditMode
              ? Permission.AdmissionDocumentTypesUpdate
              : Permission.AdmissionDocumentTypesCreate
          }
        >
          <Button
            type="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            onClick={() => form.submit()}
          >
            {isEditMode ? "Save Changes" : "Create Document Type"}
          </Button>
        </PermissionGuard>,
      ]}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: token.marginMD }}
        initialValues={{ isRequired: false, isActive: true }}
      >
        {/* Code — create mode only */}
        {!isEditMode ? (
          <Form.Item
            name="code"
            label={
              <span>
                Code&nbsp;
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: token.fontSizeSM }}
                >
                  (immutable after creation)
                </Typography.Text>
              </span>
            }
            rules={codeRules}
            extra="Lowercase slug, e.g. birth_certificate. Cannot be changed later."
          >
            <Input placeholder="e.g. birth_certificate" />
          </Form.Item>
        ) : (
          <Form.Item label="Code">
            <Typography.Text
              code
              style={{
                fontSize: token.fontSize,
                color: token.colorTextSecondary,
              }}
            >
              {target?.code}
            </Typography.Text>
          </Form.Item>
        )}

        {/* Name */}
        <Form.Item name="name" label="Name" rules={nameRules}>
          <Input
            placeholder="e.g. Birth Certificate"
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </Form.Item>

        {/* Description */}
        <Form.Item name="description" label="Description" rules={descriptionRules}>
          <Input.TextArea
            rows={3}
            placeholder="Optional description shown as help text"
          />
        </Form.Item>

        {/* MIME Types */}
        <Form.Item
          name="mimeTypes"
          label="Accepted MIME Types"
          rules={mimeTypesRules}
          extra="Files uploaded for this type will be validated against these MIME types."
        >
          <Select
            mode="tags"
            placeholder="Select or type MIME types"
            options={COMMON_MIME_TYPE_OPTIONS}
            style={{ width: "100%" }}
          />
        </Form.Item>

        {/* Max Size */}
        <Form.Item
          name="maxSizeMb"
          label="Max File Size (MB)"
          rules={maxSizeMbRules}
        >
          <InputNumber min={1} precision={0} style={{ width: "100%" }} />
        </Form.Item>

        {/* isRequired */}
        <Form.Item
          name="isRequired"
          label="Required by default"
          valuePropName="checked"
          extra="Hint for the form builder. The form field's own required flag takes precedence at runtime."
        >
          <Switch />
        </Form.Item>

        {/* isActive — edit mode only */}
        {isEditMode && (
          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
            extra="Inactive types are hidden from the form builder's FILE field options."
          >
            <Switch />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}

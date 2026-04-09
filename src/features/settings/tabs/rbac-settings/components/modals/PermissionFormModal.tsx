// Feature: rbac-settings
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Form, Input, Modal, Select } from "antd";
import { usePermissionFormModal } from "../../hooks/usePermissionModal";
import type { Permission as PermissionType } from "../../types/rbac";
import {
    permissionDescriptionRules,
    permissionNameRules,
} from "../../utils/validators";

export type PermissionFormModalProps = {
  open: boolean;
  target: PermissionType | null;
  onClose: () => void;
};

export function PermissionFormModal({ open, target, onClose }: PermissionFormModalProps) {
  const token = useToken();
  const { state, actions, form } = usePermissionFormModal(target, open, onClose);
  const { isEditMode, isSubmitting, formError, catalogueEntries } = state;
  const { handleSubmit, handleCancel, handleCatalogueSelect } = actions;

  const catalogueOptions = catalogueEntries
    .filter((entry) => !entry.isActivated)
    .map((entry) => ({
      value: entry.id,
      label: `${entry.name} (${entry.slug})`,
      entry,
    }));

  return (
    <Modal
      title={isEditMode ? "Edit Permission" : "Activate Permission"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={520}
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
        <ErrorAlert error={formError} />

        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          {/* Activate mode: catalogue select */}
          {!isEditMode && (
            <Form.Item
              label={
                <span>
                  Permission Catalogue{" "}
                  <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                </span>
              }
            >
              <Select
                showSearch
                placeholder="Search and select a permission…"
                optionFilterProp="label"
                options={catalogueOptions}
                onChange={(_, option) => {
                  const opt = Array.isArray(option) ? option[0] : option;
                  if (opt && "entry" in opt) {
                    handleCatalogueSelect(opt.entry);
                  }
                }}
                style={{ width: "100%" }}
                notFoundContent="No unactivated permissions found"
              />
            </Form.Item>
          )}

          {/* Name field */}
          <Form.Item
            name="name"
            label={
              <span>
                Name <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={permissionNameRules}
          >
            <Input placeholder="e.g. Create Permission" style={{ height: 40 }} />
          </Form.Item>

          {/* Description field */}
          <Form.Item
            name="description"
            label="Description"
            rules={permissionDescriptionRules}
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
        {isEditMode ? (
          <PermissionGuard permission={Permission.PermissionsUpdate}>
            <Button
              type="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
              onClick={() => form.submit()}
              block
              style={{ height: 48, fontWeight: 600 }}
            >
              Save Changes
            </Button>
          </PermissionGuard>
        ) : (
          <PermissionGuard permission={Permission.PermissionsCreate}>
            <Button
              type="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
              onClick={() => form.submit()}
              block
              style={{ height: 48, fontWeight: 600 }}
            >
              Activate Permission
            </Button>
          </PermissionGuard>
        )}
        <Button
          type="text"
          block
          onClick={handleCancel}
          disabled={isSubmitting}
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

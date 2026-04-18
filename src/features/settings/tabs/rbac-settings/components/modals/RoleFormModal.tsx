// Feature: rbac-settings
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Form, Input, Modal, Select } from "antd";
import { useRoleFormModal } from "../../hooks/useRoleModal";
import type { Role } from "../../types/rbac";
import { roleDescriptionRules, roleNameRules } from "../../utils/validators";

const SCOPE_OPTIONS = [
  { value: "GLOBAL", label: "Global" },
  { value: "FACULTY", label: "Faculty" },
  { value: "DEPARTMENT", label: "Department" },
  { value: "PROGRAM", label: "Program" },
];

export type RoleFormModalProps = {
  open: boolean;
  target: Role | null;
  onClose: () => void;
};

export function RoleFormModal({ open, target, onClose }: RoleFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useRoleFormModal(target, open, onClose);
  const { isEditMode, isSubmitting, formError } = state;
  const { handleSubmit, handleCancel } = actions;

  return (
    <Modal
      title={isEditMode ? "Edit Role" : "Create Role"}
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
          {/* Name field */}
          <Form.Item
            name="name"
            label={
              <span>
                Name <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={roleNameRules}
          >
            <Input placeholder="e.g. Faculty Admin" style={{ height: 40 }} />
          </Form.Item>

          {/* Scope field */}
          <Form.Item
            name="scope"
            label={
              <span>
                Scope <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            initialValue="GLOBAL"
          >
            <Select options={SCOPE_OPTIONS} style={{ width: "100%" }} />
          </Form.Item>

          {/* Description field */}
          <Form.Item
            name="description"
            label="Description"
            rules={roleDescriptionRules}
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
          <PermissionGuard permission={Permission.RolesUpdate}>
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
          <PermissionGuard permission={Permission.RolesCreate}>
            <Button
              type="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
              onClick={() => form.submit()}
              block
              style={{ height: 48, fontWeight: 600 }}
            >
              Create Role
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

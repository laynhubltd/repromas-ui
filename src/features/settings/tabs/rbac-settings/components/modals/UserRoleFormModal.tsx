// Feature: rbac-settings
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Flex, Form, InputNumber, Modal, Select } from "antd";
import { useUserRoleFormModal } from "../../hooks/useUserRoleModal";
import { deriveScopeLabel } from "../../types/rbac";
import { ScopeBadge } from "../ScopeBadge";

export type UserRoleFormModalProps = {
  open: boolean;
  userId: number;
  onClose: () => void;
  onSuccess?: () => void;
};

export function UserRoleFormModal({ open, userId, onClose, onSuccess }: UserRoleFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useUserRoleFormModal(userId, open, onClose, onSuccess);
  const { isSubmitting, formError, roles, selectedScope } = state;
  const { handleSubmit, handleCancel, handleRoleChange } = actions;

  const roleOptions = roles.map((role) => ({
    value: role.id,
    label: (
      <Flex align="center" gap={8}>
        <span>{role.name}</span>
        <ScopeBadge scope={role.scope} />
      </Flex>
    ),
  }));

  const scopeLabel = selectedScope && selectedScope !== "GLOBAL"
    ? deriveScopeLabel(selectedScope)
    : null;

  return (
    <Modal
      title="Assign Role"
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
          {/* Role selector */}
          <Form.Item
            name="roleId"
            label={
              <span>
                Role <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Please select a role." }]}
          >
            <Select
              placeholder="Select a role"
              options={roleOptions}
              onChange={handleRoleChange}
              showSearch
              filterOption={(input, option) => {
                const role = roles.find((r) => r.id === option?.value);
                return role?.name.toLowerCase().includes(input.toLowerCase()) ?? false;
              }}
              style={{ width: "100%" }}
            />
          </Form.Item>

          {/* Scope reference ID — shown only for non-GLOBAL scopes */}
          {scopeLabel && (
            <Form.Item
              name="scopeReferenceId"
              label={
                <span>
                  {scopeLabel} ID{" "}
                  <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                </span>
              }
              rules={[{ required: true, message: `Please enter the ${scopeLabel} ID.` }]}
              style={{ marginBottom: 0 }}
            >
              <InputNumber
                placeholder={`Enter ${scopeLabel} ID`}
                style={{ width: "100%", height: 40 }}
                min={1}
              />
            </Form.Item>
          )}
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
        <PermissionGuard permission={Permission.UserRolesCreate}>
          <Button
            type="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            onClick={() => form.submit()}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            Assign Role
          </Button>
        </PermissionGuard>
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

// Feature: role-permission-assign
import { useToken } from "@/shared/hooks/useToken";
import { Button, Checkbox, Input, Modal, Spin, Tag, Typography } from "antd";
import { useAddPermissionsModal } from "../../hooks/useAddPermissionsModal";

export type AddPermissionsModalProps = {
  open: boolean;
  roleId: number | null;
  assignedPermissionIds: Set<number>;
  onClose: () => void;
};

export function AddPermissionsModal({
  open,
  roleId,
  assignedPermissionIds,
  onClose,
}: AddPermissionsModalProps) {
  const token = useToken();
  const { state, actions } = useAddPermissionsModal(
    roleId,
    assignedPermissionIds,
    open,
    onClose,
  );
  const { searchTerm, availableGroups, selectedIds, isLoading, isSubmitting } = state;
  const { handleSearchChange, handleCheck, handleConfirm, handleCancel } = actions;

  return (
    <Modal
      title="Add Permissions"
      open={open}
      onCancel={handleCancel}
      width={560}
      destroyOnHidden
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="primary"
            disabled={selectedIds.size === 0}
            loading={isSubmitting}
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Input.Search
          placeholder="Search permissions…"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onSearch={handleSearchChange}
          allowClear
        />

        <Spin spinning={isLoading}>
          <div style={{ minHeight: 120, maxHeight: 400, overflowY: "auto" }}>
            {!isLoading && availableGroups.length === 0 ? (
              <Typography.Text type="secondary" style={{ display: "block", textAlign: "center", padding: "24px 0" }}>
                No permissions found.
              </Typography.Text>
            ) : (
              availableGroups.map((group) => (
                <div key={group.resource} style={{ marginBottom: 16 }}>
                  <Typography.Text
                    strong
                    style={{
                      display: "block",
                      marginBottom: 8,
                      color: token.colorTextSecondary,
                      fontSize: token.fontSizeSM,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {group.label}
                  </Typography.Text>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {group.permissions.map((perm) => (
                      <Checkbox
                        key={perm.id}
                        checked={selectedIds.has(perm.id)}
                        onChange={(e) => handleCheck(perm.id, e.target.checked)}
                      >
                        <span style={{ marginRight: 8 }}>{perm.name}</span>
                        <Tag style={{ fontFamily: "monospace", fontSize: token.fontSizeSM - 1 }}>
                          {perm.slug}
                        </Tag>
                      </Checkbox>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </Spin>
      </div>
    </Modal>
  );
}

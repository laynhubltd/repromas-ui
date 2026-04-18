// Feature: rbac-settings
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { DataLoader } from "@/shared/ui/DataLoader";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Drawer, Flex, Modal, Tag, Typography } from "antd";
import { useRolePermissionsDrawer } from "../../hooks/useRolePermissionsDrawer";
import type { Permission as PermissionType } from "../../types/rbac";
import { ScopeBadge } from "../ScopeBadge";
import { AddPermissionsModal } from "../modals/AddPermissionsModal";

type RolePermissionsDrawerProps = {
  selectedRoleId: number | null;
  open: boolean;
  onClose: () => void;
};

export function RolePermissionsDrawer({ selectedRoleId, open, onClose }: RolePermissionsDrawerProps) {
  const token = useToken();
  const { state, actions } = useRolePermissionsDrawer(selectedRoleId, open);
  const {
    role,
    isLoading,
    addPermissionsModalOpen,
    assignedPermissionIds,
    removeConfirmId,
    assignedGroups,
  } = state;
  const {
    setAddPermissionsModalOpen,
    setRemoveConfirmId,
    handleRemoveConfirm,
  } = actions;

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        placement="right"
        width={480}
        destroyOnHidden={false}
        title={
          role ? (
            <Flex align="center" gap={10}>
              <Typography.Text strong style={{ fontSize: token.fontSize }}>
                {role.name}
              </Typography.Text>
              <ScopeBadge scope={role.scope} />
            </Flex>
          ) : (
            "Manage Permissions"
          )
        }
      >
        <DataLoader loading={isLoading} loader={<SkeletonRows count={4} variant="card" />}>
          {/* Add Permissions button */}
          <PermissionGuard permission={Permission.RolesUpdate}>
            <div style={{ marginBottom: 20 }}>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => setAddPermissionsModalOpen(true)}
                block
              >
                Add Permissions
              </Button>
            </div>
          </PermissionGuard>

          {/* Assigned permissions grouped by resource */}
          {assignedGroups.length === 0 ? (
            <Typography.Text
              type="secondary"
              style={{ display: "block", textAlign: "center", padding: "32px 0" }}
            >
              No permissions assigned yet.
            </Typography.Text>
          ) : (
            <Flex vertical gap={20}>
              {assignedGroups.map((group) => (
                <div key={group.resource}>
                  <Typography.Text
                    strong
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: token.fontSizeSM,
                      color: token.colorTextSecondary,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {group.label}
                  </Typography.Text>
                  <Flex vertical gap={6}>
                    {group.permissions.map((perm: PermissionType) => (
                      <Flex
                        key={perm.id}
                        align="center"
                        justify="space-between"
                        style={{
                          padding: "8px 12px",
                          borderRadius: token.borderRadiusSM,
                          background: token.colorFillAlter,
                          border: `1px solid ${token.colorBorderSecondary}`,
                        }}
                      >
                        <Flex vertical gap={2}>
                          <Typography.Text style={{ fontSize: token.fontSizeSM }}>
                            {perm.name}
                          </Typography.Text>
                          <Tag
                            style={{
                              fontSize: token.fontSizeSM - 2,
                              lineHeight: "16px",
                              margin: 0,
                              width: "fit-content",
                            }}
                          >
                            {perm.slug}
                          </Tag>
                        </Flex>
                        <PermissionGuard permission={Permission.RolesUpdate}>
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => setRemoveConfirmId(perm.id)}
                            title="Remove"
                          />
                        </PermissionGuard>
                      </Flex>
                    ))}
                  </Flex>
                </div>
              ))}
            </Flex>
          )}
        </DataLoader>
      </Drawer>

      {/* Add Permissions Modal */}
      <AddPermissionsModal
        open={addPermissionsModalOpen}
        roleId={selectedRoleId}
        assignedPermissionIds={assignedPermissionIds}
        onClose={() => setAddPermissionsModalOpen(false)}
      />

      {/* Remove confirmation modal */}
      <Modal
        title="Remove Permission"
        open={removeConfirmId !== null}
        onOk={handleRemoveConfirm}
        onCancel={() => setRemoveConfirmId(null)}
        okText="Remove"
        okButtonProps={{ danger: true }}
        width={400}
      >
        <Typography.Text>
          Remove this permission from the role? The permission will still exist in the tenant.
        </Typography.Text>
      </Modal>
    </>
  );
}

// Feature: rbac-settings
import { Table } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { centeredBox, ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { DeleteOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Drawer, Flex, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useUserRolesPanel } from "../../hooks/useUserRolesPanel";
import type { UserRole } from "../../types/rbac";
import { RevokeUserRoleModal } from "../modals/RevokeUserRoleModal";
import { UserRoleFormModal } from "../modals/UserRoleFormModal";
import { ScopeBadge } from "../ScopeBadge";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export type UserRolesPanelProps = {
  userId: number;
  open: boolean;
  onClose: () => void;
};

export function UserRolesPanel({ userId, open, onClose }: UserRolesPanelProps) {
  const token = useToken();
  const { state, actions, flags } = useUserRolesPanel(userId);
  const {
    userRoles,
    totalItems,
    isLoading,
    isError,
    assignModalOpen,
    revokeTarget,
    showNextLoginCallout,
  } = state;
  const {
    setAssignModalOpen,
    setRevokeTarget,
    handleAssignSuccess,
    handleRevokeSuccess,
    refetch,
  } = actions;
  const { hasData } = flags;

  const columns: ColumnsType<UserRole> = [
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
      render: (roleName: string, record: UserRole) => (
        <Flex align="center" gap={8}>
          <Typography.Text strong>{roleName}</Typography.Text>
          <ScopeBadge scope={record.scope} />
        </Flex>
      ),
    },
    {
      title: "Scope Ref ID",
      dataIndex: "scopeReferenceId",
      key: "scopeReferenceId",
      render: (scopeReferenceId: number | null) => (
        <Typography.Text type="secondary">
          {scopeReferenceId !== null ? scopeReferenceId : "—"}
        </Typography.Text>
      ),
    },
    {
      title: "Assigned At",
      dataIndex: "assignedAt",
      key: "assignedAt",
      render: (assignedAt: string) => formatDate(assignedAt),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      width: 60,
      render: (_: unknown, record: UserRole) => (
        <PermissionGuard permission={Permission.UserRolesDelete}>
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined style={{ fontSize: 16 }} />}
            onClick={() => setRevokeTarget(record)}
            title="Revoke"
          />
        </PermissionGuard>
      ),
    },
  ];

  return (
    <PermissionGuard permission={Permission.UserRolesList}>
      <Drawer
        title={
          <Flex align="center" gap={8}>
            <UserOutlined />
            <span>User Role Assignments</span>
          </Flex>
        }
        placement="right"
        width={600}
        open={open}
        onClose={onClose}
        destroyOnClose={false}
      >
        <Flex vertical gap={16}>
          {/* Next login callout */}
          <ConditionalRenderer when={showNextLoginCallout}>
            <Alert
              type="info"
              showIcon
              message="Permission changes take effect on the user's next login or token refresh."
            />
          </ConditionalRenderer>

          {/* Toolbar */}
          <Flex justify="flex-end">
            <PermissionGuard permission={Permission.UserRolesCreate}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAssignModalOpen(true)}
                style={{ fontWeight: 600 }}
              >
                Assign Role
              </Button>
            </PermissionGuard>
          </Flex>

          {/* Table area */}
          <DataLoader loading={isLoading} loader={<SkeletonRows count={5} variant="card" />}>
            <ConditionalRenderer when={isError}>
              <ErrorAlert
                variant="section"
                error="Failed to load user role assignments"
                onRetry={refetch}
              />
            </ConditionalRenderer>

            <ConditionalRenderer
              when={!isError && !hasData}
              wrapper={centeredBox({
                border: `1px dashed ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                background: token.colorBgContainer,
              })}
            >
              <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                No roles assigned to this user yet.
              </Typography.Text>
              <PermissionGuard permission={Permission.UserRolesCreate}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setAssignModalOpen(true)}
                  style={{ fontWeight: 600 }}
                >
                  Assign Role
                </Button>
              </PermissionGuard>
            </ConditionalRenderer>

            <ConditionalRenderer when={!isError && hasData}>
              <Table<UserRole>
                rowKey="id"
                dataSource={userRoles}
                columns={columns}
                size="md"
                density="comfortable"
                pagination={{
                  pageSize: 30,
                  total: totalItems,
                  showSizeChanger: false,
                }}
              />
            </ConditionalRenderer>
          </DataLoader>
        </Flex>

        {/* Modals */}
        <UserRoleFormModal
          open={assignModalOpen}
          userId={userId}
          onClose={() => setAssignModalOpen(false)}
          onSuccess={handleAssignSuccess}
        />
        <RevokeUserRoleModal
          open={revokeTarget !== null}
          target={revokeTarget}
          userId={userId}
          onClose={() => setRevokeTarget(null)}
          onSuccess={handleRevokeSuccess}
        />
      </Drawer>
    </PermissionGuard>
  );
}

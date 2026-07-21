import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { PlusOutlined, TeamOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Typography } from "antd";
import { useManageUserRolesModal, useUserFormModal } from "../hooks/useUserModal";
import { useResendPasswordModal, useUserDrawer } from "../hooks/useUserDrawer";
import { useUserManagementTab } from "../hooks/useUserManagementTab";
import { ManageUserRolesModal } from "./modals/ManageUserRolesModal";
import { ResendPasswordModal } from "./modals/ResendPasswordModal";
import { UserFormModal } from "./modals/UserFormModal";
import { UserDrawer } from "./UserDrawer";
import { UserTable } from "./UserTable";

export function UserManagementTab() {
  const tab = useUserManagementTab();

  // Modal/drawer hooks — receive targets from tab state
  const userFormController = useUserFormModal(
    tab.state.formTarget,
    tab.state.formModalOpen,
    tab.actions.handleCloseForm,
    tab.state.roles,
  );

  const manageRolesController = useManageUserRolesModal(
    tab.state.roleModalTarget,
    tab.state.roleModalOpen,
    tab.actions.handleCloseRoleModal,
  );

  const userDrawerController = useUserDrawer(
    tab.state.drawerTarget?.id ?? null,
    tab.state.drawerOpen,
  );

  const resendController = useResendPasswordModal(
    tab.state.resendTarget?.email ?? null,
    tab.state.resendModalOpen,
    tab.actions.handleCloseResend,
  );

  return (
    <Flex vertical gap={16} style={{ width: "100%" }}>
      {/* Header */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
        <Flex align="center" gap={8}>
          <TeamOutlined style={{ fontSize: 20 }} />
          <Typography.Title level={5} style={{ margin: 0 }}>
            Users
          </Typography.Title>
          <Typography.Text type="secondary">
            ({tab.state.totalItems})
          </Typography.Text>
        </Flex>

        <Flex align="center" gap={8}>
          <Input.Search
            placeholder="Search users…"
            allowClear
            value={tab.state.search}
            onChange={(e) => tab.actions.handleSearchChange(e.target.value)}
            onSearch={tab.actions.handleSearchChange}
            style={{ width: 240 }}
          />

          <PermissionGuard permission={Permission.UserRolesCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={tab.actions.handleOpenCreate}
            >
              Add User
            </Button>
          </PermissionGuard>
        </Flex>
      </Flex>

      {/* Section fetch error */}
      <ErrorAlert
        variant="section"
        error={tab.state.sectionError}
        onRetry={tab.actions.refetch}
      />

      {/* User table */}
      <UserTable
        users={tab.state.users}
        totalItems={tab.state.totalItems}
        page={tab.state.page}
        isLoading={tab.state.isLoading}
        actions={tab.actions}
      />

      {/* Create / Edit modal */}
      <UserFormModal
        open={tab.state.formModalOpen}
        target={tab.state.formTarget}
        controller={userFormController}
        roleOptions={tab.state.roleOptions}
        isRolesLoading={tab.state.isRolesLoading}
      />

      {/* Manage roles modal */}
      <ManageUserRolesModal
        open={tab.state.roleModalOpen}
        target={tab.state.roleModalTarget}
        controller={manageRolesController}
      />

      {/* Resend password modal */}
      <ResendPasswordModal
        open={tab.state.resendModalOpen}
        target={tab.state.resendTarget}
        onClose={tab.actions.handleCloseResend}
        controller={resendController}
      />

      {/* Detail drawer */}
      <UserDrawer
        open={tab.state.drawerOpen}
        onClose={tab.actions.handleCloseDrawer}
        controller={userDrawerController}
      />
    </Flex>
  );
}

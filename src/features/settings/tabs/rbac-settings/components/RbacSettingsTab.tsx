// Feature: rbac-settings
import { useAppSelector } from "@/app/hooks";
import { DashCard } from "@/components/ui-kit";
import { Col, Flex, Row } from "antd";
import { useState } from "react";
import { useRbacSettingsTab } from "../hooks/useRbacSettingsTab";
import { PermissionsPanel } from "./panels/PermissionsPanel";
import { RolesPanel } from "./panels/RolesPanel";
import { UserRolesPanel } from "./panels/UserRolesPanel";

export function RbacSettingsTab() {
  const { state } = useRbacSettingsTab();
  const { permissionsTotal, rolesTotal, userRolesTotal, isMetricsLoading } = state;

  const userProfile = useAppSelector((s) => s.auth.userProfile);
  const userId = userProfile?.id ? parseInt(userProfile.id, 10) : 0;

  const [userRolesOpen, setUserRolesOpen] = useState(false);

  const cardState = isMetricsLoading ? "loading" : "default";

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      {/* Metrics row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <DashCard
            title="Total Permissions"
            value={permissionsTotal}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={8}>
          <DashCard
            title="Total Roles"
            value={rolesTotal}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={8}>
          <DashCard
            title="User Role Assignments"
            value={userRolesTotal}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      {/* Toolbar */}
      {/* <Flex justify="flex-end">
        <PermissionGuard permission={Permission.UserRolesList}>
          <Button
            icon={<TeamOutlined />}
            onClick={() => setUserRolesOpen(true)}
          >
            Manage User Roles
          </Button>
        </PermissionGuard>
      </Flex> */}

      {/* Sub-panels */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={6} lg={6} xl={8} xxl={8} xxxl={8}>
          <PermissionsPanel />
        </Col>
        <Col xs={24} sm={24} md={18} lg={18} xl={16} xxl={16} xxxl={16}>
          <RolesPanel />
        </Col>
      </Row>

      {/* User Roles Drawer */}
      {userId !== 0 && (
        <UserRolesPanel
          userId={userId}
          open={userRolesOpen}
          onClose={() => setUserRolesOpen(false)}
        />
      )}
    </Flex>
  );
}

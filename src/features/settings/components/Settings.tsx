import { Tabs } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  BookOutlined,
  CalendarOutlined,
  PartitionOutlined,
  SafetyOutlined,
  SettingOutlined,
  SwapOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useMemo } from "react";
import { useSettingsPage } from "../hooks/useSettingsPage";
import { AcademicCalendarTab } from "../tabs/academic-calendar";
import { CurriculumVersionTab } from "../tabs/curriculum-version";
import { LevelConfigTab } from "../tabs/level-config";
import { RbacSettingsTab } from "../tabs/rbac-settings";
import { TransitionStatusTab } from "../tabs/student-transition-status";
import { SystemConfigTab } from "../tabs/system-config";
import { SystemTimeFramesTab } from "../tabs/system-timeframes";
import { UserManagementTab } from "../tabs/user-management";

export default function Settings() {
  const { state, actions } = useSettingsPage();

  const allTabItems = useMemo(
    () => [
      {
        key: "roles-permissions",
        label: (
          <PermissionGuard
            permission={[Permission.RolesList, Permission.PermissionsList]}
          >
            <span>
              <SafetyOutlined /> Roles & Permissions
            </span>
          </PermissionGuard>
        ),
        children: <RbacSettingsTab />,
      },
      {
        key: "user-management",
        label: (
          <PermissionGuard permission={Permission.UsersList}>
            <span>
              <TeamOutlined /> Users
            </span>
          </PermissionGuard>
        ),
        children: <UserManagementTab />,
      },
      {
        key: "system-config",
        label: (
          <PermissionGuard permission={[Permission.SystemConfigsList]}>
            <span>
              <SettingOutlined /> System Config
            </span>
          </PermissionGuard>
        ),
        children: <SystemConfigTab />,
      },
      {
        key: "academic-calendar",
        label: (
          <span>
            <CalendarOutlined /> Calendar
          </span>
        ),
        children: <AcademicCalendarTab />,
      },
      {
        key: "level-config",
        label: (
          <span>
            <PartitionOutlined /> Levels
          </span>
        ),
        children: <LevelConfigTab />,
      },
      {
        key: "curriculum-versions",
        label: (
          <span>
            <BookOutlined />
            Curriculum Versions
          </span>
        ),
        children: <CurriculumVersionTab />,
      },
      {
        key: "system-timeframe",
        label: (
          <PermissionGuard permission={[Permission.SystemTimeFramesList]}>
            <span>
              <CalendarOutlined /> Time Frame
            </span>
          </PermissionGuard>
        ),
        children: <SystemTimeFramesTab />,
      },
      {
        key: "student-transition-status",
        label: (
          <span>
            <SwapOutlined /> Transition Statuses
          </span>
        ),
        children: <TransitionStatusTab />,
      },
    ],
    [],
  );

  const tabItems = useMemo(
    () =>
      allTabItems.filter((tab) =>
        (state.allowedTabKeys as readonly string[]).includes(tab.key),
      ),
    [allTabItems, state.allowedTabKeys],
  );

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <Tabs
        items={tabItems}
        activeKey={state.activeKey}
        onChange={actions.handleTabChange}
        size="md"
        density="compact"
        variant="outlined"
        aria-label="Settings navigation"
      />
    </div>
  );
}

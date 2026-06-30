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
} from "@ant-design/icons";
import { Typography } from "antd";
import { useMemo } from "react";
import { useSettingsPage } from "../hooks/useSettingsPage";
import { AcademicCalendarTab } from "../tabs/academic-calendar";
import { CurriculumVersionTab } from "../tabs/curriculum-version";
import { LevelConfigTab } from "../tabs/level-config";
import { RbacSettingsTab } from "../tabs/rbac-settings";
import { TransitionStatusTab } from "../tabs/student-transition-status";
import { SystemConfigTab } from "../tabs/system-config";
import { SystemTimeFramesTab } from "../tabs/system-timeframes";

export default function Settings() {
  const { state, actions } = useSettingsPage();

  const allTabItems = useMemo(
    () => [
      {
        key: "academic-calendar",
        label: (
          <span>
            <CalendarOutlined /> Academic Calendar
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
        key: "system-timeframe",
        label: (
          <PermissionGuard permission={[Permission.SystemTimeFramesList]}>
            <span>
              <CalendarOutlined /> System Time Frame
            </span>
          </PermissionGuard>
        ),
        children: <SystemTimeFramesTab />,
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
        key: "student-transition-status",
        label: (
          <span>
            <SwapOutlined /> Transition Statuses
          </span>
        ),
        children: <TransitionStatusTab />,
      },
      {
        key: "general",
        label: (
          <span>
            <SettingOutlined /> General
          </span>
        ),
        children: (
          <div style={{ padding: 24 }}>
            <Typography.Text type="secondary">
              General settings placeholder. Configure system-wide options here.
            </Typography.Text>
          </div>
        ),
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

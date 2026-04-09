import { Tabs } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { BookOutlined, CalendarOutlined, PartitionOutlined, SafetyOutlined, SettingOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { AcademicCalendarTab } from "../tabs/academic-calendar";
import { CurriculumVersionTab } from "../tabs/curriculum-version";
import { LevelConfigTab } from "../tabs/level-config";
import { RbacSettingsTab } from "../tabs/rbac-settings";

export default function Settings() {
  const tabItems = [
    {
      key: "curriculum-versions",
      label: <span><BookOutlined />Curriculum Versions</span>,
      children: <CurriculumVersionTab />,
    },
    {
      key: "level-config",
      label: <span><PartitionOutlined /> Levels</span>,
      children: <LevelConfigTab />,
    },
    {
      key: "academic-calendar",
      label: <span><CalendarOutlined /> Academic Calendar</span>,
      children: <AcademicCalendarTab />,
    },
    {
      key: "roles-permissions",
      label: (
        <PermissionGuard permission={[Permission.RolesList, Permission.PermissionsList]}>
          <span><SafetyOutlined /> Roles & Permissions</span>
        </PermissionGuard>
      ),
      children: <RbacSettingsTab />,
    },
    {
      key: "general",
      label: <span><SettingOutlined /> General</span>,
      children: (
        <div style={{ padding: 24 }}>
          <Typography.Text type="secondary">
            General settings placeholder. Configure system-wide options here.
          </Typography.Text>
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <Tabs
        items={tabItems}
        defaultActiveKey="curriculum-versions"
        size="md"
        density="spacious"
        variant="default"
        aria-label="Settings navigation"
      />
    </div>
  );
}

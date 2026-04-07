import { Tabs } from "@/components/ui-kit";
import { BookOutlined, CalendarOutlined, PartitionOutlined, SettingOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { AcademicCalendarTab } from "../tabs/academic-calendar";
import { CurriculumVersionTab } from "../tabs/curriculum-version";
import { LevelConfigTab } from "../tabs/level-config";

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

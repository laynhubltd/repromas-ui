import { DashCard, ResponsiveCollapsibleGrid } from "@/components/ui-kit";
import {
  AppstoreOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Space, Typography } from "antd";

const DASHBOARD_KPI_ITEMS = [
  {
    title: "Active Modules",
    meta: "Across configured tenant features",
    value: 12,
    trend: "2 new this week",
    icon: <AppstoreOutlined />,
  },
  {
    title: "Online Users",
    meta: "Current authenticated sessions",
    value: 184,
    trend: "Peak: 247 today",
    icon: <TeamOutlined />,
  },
  {
    title: "Sync Status",
    meta: "Background jobs and data refresh",
    value: "Healthy",
    trend: "Last completed 4 minutes ago",
    icon: <ClockCircleOutlined />,
  },
] as const;

export default function Dashboard() {
  const kpiSections = DASHBOARD_KPI_ITEMS.map((item) => ({
    key: item.title,
    title: item.title,
    subtitle: item.meta,
    content: (
      <DashCard
        title={item.title}
        meta={item.meta}
        value={item.value}
        trend={item.trend}
        icon={item.icon}
        size="sm"
        density="comfortable"
      />
    ),
    mobileContent: (
      <Space direction="vertical" size={2} style={{ width: "100%" }}>
        <Typography.Text strong>{item.value}</Typography.Text>
        <Typography.Text type="secondary">{item.trend}</Typography.Text>
      </Space>
    ),
    desktopColProps: {
      xs: 24,
      md: 12,
      xl: 8,
    },
  }));

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        Dashboard
      </Typography.Title>

      <ResponsiveCollapsibleGrid
        sections={kpiSections}
        collapseBelow="md"
        mobileExpansionMode="multiple"
        defaultMobileExpandedKeys={[DASHBOARD_KPI_ITEMS[0].title]}
        mobileAriaLabel="Dashboard KPI sections"
      />
    </Space>
  );
}

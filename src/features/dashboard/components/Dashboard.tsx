import {
  AppstoreOutlined,
  AuditOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Accordion,
  Card,
  DashCard,
  Explainer,
  ItemList,
  InlineStatus,
  NotificationTray,
  Panel,
  ResponsiveCollapsibleGrid,
  Table,
  type ItemListItem,
  type NotificationRecord,
  type TableProps,
} from "@/components/ui-kit";
import { Space, Tag, Typography } from "antd";

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

const DASHBOARD_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: "notif-sync-success",
    groupKey: "now",
    groupLabel: "Now",
    severity: "success",
    title: "Configuration sync completed",
    body: "Shared settings are now available across active modules.",
    timestamp: "2 min ago",
    icon: <CheckCircleOutlined />,
    action: <Typography.Link>View changes</Typography.Link>,
    dismissible: true,
  },
  {
    id: "notif-review-info",
    groupKey: "now",
    groupLabel: "Now",
    severity: "info",
    title: "Review queue updated",
    body: "New records are ready for validation in the admin workspace.",
    timestamp: "5 min ago",
    icon: <InfoCircleOutlined />,
    action: <Typography.Link>Open queue</Typography.Link>,
  },
  {
    id: "notif-maintenance-warning",
    groupKey: "earlier",
    groupLabel: "Earlier",
    severity: "warning",
    title: "Background maintenance scheduled",
    body: "A short maintenance window is planned for non-critical services.",
    timestamp: "40 min ago",
    icon: <WarningOutlined />,
    dismissible: true,
  },
];

type DashboardActivityStatus = "Healthy" | "In Review" | "Attention";

interface DashboardActivityRow {
  key: string;
  area: string;
  owner: string;
  status: DashboardActivityStatus;
  updatedAt: string;
}

const DASHBOARD_STATUS_COLOR: Record<DashboardActivityStatus, string> = {
  Healthy: "success",
  "In Review": "processing",
  Attention: "warning",
};

const DASHBOARD_ACTIVITY_COLUMNS: TableProps<DashboardActivityRow>["columns"] = [
  {
    title: "Module Area",
    dataIndex: "area",
    key: "area",
    render: (area: string) => <Typography.Text strong>{area}</Typography.Text>,
  },
  {
    title: "Owner",
    dataIndex: "owner",
    key: "owner",
    render: (owner: string) => <Typography.Text type="secondary">{owner}</Typography.Text>,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: DashboardActivityStatus) => (
      <Tag color={DASHBOARD_STATUS_COLOR[status]} style={{ marginInlineEnd: 0 }}>
        {status}
      </Tag>
    ),
  },
  {
    title: "Updated",
    dataIndex: "updatedAt",
    key: "updatedAt",
    align: "right",
    render: (updatedAt: string) => <Typography.Text type="secondary">{updatedAt}</Typography.Text>,
  },
];

const DASHBOARD_ACTIVITY_ROWS: DashboardActivityRow[] = [
  {
    key: "activity-1",
    area: "Admissions",
    owner: "Operations",
    status: "Healthy",
    updatedAt: "2m ago",
  },
  {
    key: "activity-2",
    area: "Program Quotas",
    owner: "Academic Team",
    status: "In Review",
    updatedAt: "15m ago",
  },
  {
    key: "activity-3",
    area: "User Access",
    owner: "Platform Admin",
    status: "Attention",
    updatedAt: "31m ago",
  },
];

const DASHBOARD_EMPTY_ACTIVITY_ROWS: DashboardActivityRow[] = [];

const DASHBOARD_CONTEXT_ITEMS: ItemListItem[] = [
  {
    key: "context-1",
    leading: <SettingOutlined />,
    content: (
      <Space direction="vertical" size={0}>
        <Typography.Text strong>Configuration Health</Typography.Text>
        <Typography.Text type="secondary">
          Track pending setup checks across critical modules.
        </Typography.Text>
      </Space>
    ),
    trailing: <Typography.Text type="secondary">Tracked</Typography.Text>,
  },
  {
    key: "context-2",
    leading: <DatabaseOutlined />,
    content: (
      <Space direction="vertical" size={0}>
        <Typography.Text strong>Data Sync Watch</Typography.Text>
        <Typography.Text type="secondary">
          Monitor import/export consistency and sync latency.
        </Typography.Text>
      </Space>
    ),
    trailing: <Typography.Text type="secondary">Stable</Typography.Text>,
  },
  {
    key: "context-3",
    leading: <AuditOutlined />,
    content: (
      <Space direction="vertical" size={0}>
        <Typography.Text strong>Review Capacity</Typography.Text>
        <Typography.Text type="secondary">
          Keep moderation queue volume visible for planning.
        </Typography.Text>
      </Space>
    ),
    trailing: <Typography.Text type="secondary">Normal</Typography.Text>,
  },
];

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

      <Panel
        title="Workspace Overview"
        subtitle="Reusable surface primitives integrated on an existing screen."
        collapsible
        actions={
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            UI Kit Preview
          </Typography.Text>
        }
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Accordion
            expansionMode="single"
            defaultActiveKeys={["pattern-foundation"]}
            aria-label="Workspace overview sections"
            items={[
              {
                key: "pattern-foundation",
                title: "Pattern Foundation",
                content: (
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
                    Keep behavior in reusable components while feature screens only pass content and
                    layout intent.
                  </Typography.Paragraph>
                ),
              },
              {
                key: "mobile-collapse",
                title: "Mobile Collapse Behavior",
                content: (
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
                    Desktop KPI tiles remain grouped in order, and the same groups collapse into
                    accessible mobile sections.
                  </Typography.Paragraph>
                ),
              },
            ]}
          />

          <Explainer
            variant="panel"
            mode="dismissible"
            title="Guidance pattern in this screen"
            description="Use Explainer for instructional help and next-step guidance. Use Notifier components for live system statuses, alerts, and event feedback."
            icon={<InfoCircleOutlined />}
            action={<Typography.Link>Read guidance principles</Typography.Link>}
          />

          <Card
            header={<Typography.Text strong>Quick Start</Typography.Text>}
            variant="filled"
            density="comfortable"
            footer={
              <Typography.Text type="secondary">
                Primitives stay reusable while screen content remains feature-owned.
              </Typography.Text>
            }
          >
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                Welcome to Repromas. Use the sidebar to navigate modules and validate responsive
                surface behavior.
              </Typography.Paragraph>
              <Explainer
                variant="inline"
                mode="persistent"
                title="Need a quick orientation?"
                description="Explainer hints stay with the UI surface and teach controls over time without behaving like alert banners."
                icon={<InfoCircleOutlined />}
                action={<Typography.Link>Open quick-start tips</Typography.Link>}
              />
            </Space>
          </Card>

          <Table<DashboardActivityRow>
            header={{
              title: "Recent Workspace Activity",
              subtitle: "Reusable table wrapper with shared header, empty and pagination behavior.",
            }}
            size="md"
            density="compact"
            columns={DASHBOARD_ACTIVITY_COLUMNS}
            dataSource={DASHBOARD_ACTIVITY_ROWS}
            rowKey="key"
            pagination={{ pageSize: 3 }}
          />

          <Table<DashboardActivityRow>
            header={{
              title: "Action Queue",
              subtitle: "Empty-state guidance block rendered inside the shared table wrapper.",
            }}
            size="sm"
            density="compact"
            columns={DASHBOARD_ACTIVITY_COLUMNS}
            dataSource={DASHBOARD_EMPTY_ACTIVITY_ROWS}
            rowKey="key"
            pagination={false}
            emptyState={{
              title: "No queued actions",
              description: "A guidance block can direct first-time users to the next meaningful step.",
              action: (
                <Explainer
                  variant="empty-state"
                  mode="dismissible"
                  size="sm"
                  title="Start by applying owner and status filters"
                  description="Filtering the workspace reveals actionable records as soon as teams begin updating entries."
                  icon={<InfoCircleOutlined />}
                  action={<Typography.Link>View filter walkthrough</Typography.Link>}
                />
              ),
            }}
          />

          <ItemList
            variant="media"
            density="comfortable"
            items={DASHBOARD_CONTEXT_ITEMS}
            aria-label="Workspace context list"
          />

          <ItemList
            variant="simple"
            density="comfortable"
            items={[]}
            aria-label="Workflow guidance list"
            emptyState={
              <Explainer
                variant="inline"
                mode="persistent"
                title="No workflow notes yet"
                description="When lists are empty, use an explainer to tell users what to do next."
                icon={<InfoCircleOutlined />}
                action={<Typography.Link>Create first workflow note</Typography.Link>}
              />
            }
          />

          <InlineStatus
            severity="info"
            title="Notifier primitives preview"
            body="Inline status components are reusable across screens and support actions, timestamp metadata, and severity semantics."
            timestamp="Updated moments ago"
            action={<Typography.Link>Read usage notes</Typography.Link>}
          />

          <NotificationTray
            title="System Notifications"
            ariaLabel="System notifications list"
            mode="grouped"
            notifications={DASHBOARD_NOTIFICATIONS}
            maxHeight={320}
          />
        </Space>
      </Panel>
    </Space>
  );
}

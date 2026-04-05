import type { TabItem } from "@/components/ui-kit";
import {
  Accordion,
  Card,
  DashCard,
  ExplainerBadge,
  ExplainerCallout,
  ExplainerSpotlight,
  ExplainerTooltip,
  InlineStatus,
  ItemList,
  Modal,
  NotificationTray,
  Panel,
  ResponsiveCollapsibleGrid,
  Table,
  Tabs
} from "@/components/ui-kit";
import type { NotificationRecord } from "@/components/ui-kit/notifiers/types";
import {
  ApartmentOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  BellOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Button, Col, Flex, Progress, Row, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

// ─── Walkthrough steps ───────────────────────────────────────────────────────

const tourSteps = [
  {
    key: "t1",
    title: "Welcome to your Dashboard",
    body: "This is your central hub. You can monitor students, staff, faculties, and system health all from here.",
    media: (
      <div style={{ fontSize: 40, textAlign: "center" }}>🎓</div>
    ),
  },
  {
    key: "t2",
    title: "Stat Cards",
    body: "The four cards at the top give you a live snapshot of enrolment, staff headcount, departments, and faculties.",
  },
  {
    key: "t3",
    title: "Notifications",
    body: "System and academic alerts appear in the notification trays. Dismiss them once actioned.",
  },
  {
    key: "t4",
    title: "Permissions are now enforced",
    body: "Access to routes and UI sections is controlled by your assigned roles. Contact your admin if something is missing.",
  },
];

// ─── Dummy data ──────────────────────────────────────────────────────────────

const recentStudents = [
  { key: "1", name: "Amara Osei", program: "Computer Science", level: "300", status: "Active", gpa: 3.8 },
  { key: "2", name: "Fatima Al-Rashid", program: "Nursing", level: "200", status: "Active", gpa: 3.5 },
  { key: "3", name: "Kwame Mensah", program: "Engineering", level: "400", status: "Suspended", gpa: 2.1 },
  { key: "4", name: "Zara Nwosu", program: "Law", level: "100", status: "Active", gpa: 3.9 },
  { key: "5", name: "Ibrahim Diallo", program: "Medicine", level: "500", status: "Active", gpa: 3.7 },
];

const staffList = [
  { key: "s1", name: "Dr. Ama Boateng", role: "Dean", department: "Sciences", status: "Active" },
  { key: "s2", name: "Prof. Kofi Asante", role: "HOD", department: "Engineering", status: "Active" },
  { key: "s3", name: "Mrs. Efua Darko", role: "Lecturer", department: "Law", status: "On Leave" },
  { key: "s4", name: "Mr. Yaw Owusu", role: "Admin", department: "Registry", status: "Active" },
];

const studentColumns: ColumnsType<(typeof recentStudents)[0]> = [
  {
    title: "Name", dataIndex: "name", key: "name",
    render: (v: string) => (
      <Flex align="center" gap={8}>
        <Avatar size="small" style={{ background: "#003049" }}>{v[0]}</Avatar>
        <Typography.Text>{v}</Typography.Text>
      </Flex>
    ),
  },
  { title: "Program", dataIndex: "program", key: "program" },
  { title: "Level", dataIndex: "level", key: "level", width: 70 },
  {
    title: "GPA", dataIndex: "gpa", key: "gpa", width: 70,
    render: (v: number) => (
      <Typography.Text type={v >= 3.5 ? "success" : v >= 2.5 ? "warning" : "danger"}>{v}</Typography.Text>
    ),
  },
  {
    title: "Status", dataIndex: "status", key: "status",
    render: (v: string) => <Tag color={v === "Active" ? "green" : "orange"}>{v}</Tag>,
  },
];

const staffColumns: ColumnsType<(typeof staffList)[0]> = [
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "Role", dataIndex: "role", key: "role" },
  { title: "Department", dataIndex: "department", key: "department" },
  {
    title: "Status", dataIndex: "status", key: "status",
    render: (v: string) => <Tag color={v === "Active" ? "green" : "gold"}>{v}</Tag>,
  },
];

const initialNotifications: NotificationRecord[] = [
  {
    id: "n1", severity: "error",
    title: "Server error on student portal",
    body: "503 responses detected on /api/students endpoint.",
    timestamp: "2 min ago", dismissible: true,
    groupKey: "system", groupLabel: "System Alerts",
  },
  {
    id: "n2", severity: "warning",
    title: "Registration deadline approaching",
    body: "Semester registration closes in 3 days.",
    timestamp: "1 hr ago", dismissible: true,
    groupKey: "academic", groupLabel: "Academic",
  },
  {
    id: "n3", severity: "success",
    title: "Grading export complete",
    body: "200 score sheets exported successfully.",
    timestamp: "3 hr ago", dismissible: true,
    groupKey: "academic", groupLabel: "Academic",
  },
  {
    id: "n4", severity: "info",
    title: "New staff member onboarded",
    body: "Dr. Ama Boateng has been added to Sciences faculty.",
    timestamp: "Yesterday", dismissible: true,
    groupKey: "system", groupLabel: "System Alerts",
  },
];

const topStudentItems = [
  {
    key: "t1",
    leading: <TrophyOutlined style={{ color: "#faad14" }} />,
    content: (
      <Flex justify="space-between" align="center">
        <Flex vertical gap={2}>
          <Typography.Text strong>Zara Nwosu</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>Law · Level 100</Typography.Text>
        </Flex>
        <Typography.Text type="success" strong>3.9 GPA</Typography.Text>
      </Flex>
    ),
  },
  {
    key: "t2",
    leading: <TrophyOutlined style={{ color: "#8c8c8c" }} />,
    content: (
      <Flex justify="space-between" align="center">
        <Flex vertical gap={2}>
          <Typography.Text strong>Amara Osei</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>Computer Science · Level 300</Typography.Text>
        </Flex>
        <Typography.Text type="success" strong>3.8 GPA</Typography.Text>
      </Flex>
    ),
  },
  {
    key: "t3",
    leading: <TrophyOutlined style={{ color: "#d46b08" }} />,
    content: (
      <Flex justify="space-between" align="center">
        <Flex vertical gap={2}>
          <Typography.Text strong>Ibrahim Diallo</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>Medicine · Level 500</Typography.Text>
        </Flex>
        <Typography.Text type="success" strong>3.7 GPA</Typography.Text>
      </Flex>
    ),
  },
];

const departmentNavItems = [
  {
    key: "d1", leading: <ApartmentOutlined />,
    content: (
      <Flex justify="space-between" align="center">
        <Flex vertical gap={2}>
          <Typography.Text strong>Computer Science</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>Faculty of Sciences</Typography.Text>
        </Flex>
        <Tag color="blue">142</Tag>
      </Flex>
    ),
    onClick: () => {},
  },
  {
    key: "d2", leading: <ApartmentOutlined />,
    content: (
      <Flex justify="space-between" align="center">
        <Flex vertical gap={2}>
          <Typography.Text strong>Engineering</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>Faculty of Engineering</Typography.Text>
        </Flex>
        <Tag color="blue">98</Tag>
      </Flex>
    ),
    onClick: () => {},
  },
  {
    key: "d3", leading: <ApartmentOutlined />,
    content: (
      <Flex justify="space-between" align="center">
        <Flex vertical gap={2}>
          <Typography.Text strong>Medicine</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>Faculty of Health Sciences</Typography.Text>
        </Flex>
        <Tag color="blue">210</Tag>
      </Flex>
    ),
    onClick: () => {},
  },
  {
    key: "d4", leading: <ApartmentOutlined />,
    content: (
      <Flex justify="space-between" align="center">
        <Flex vertical gap={2}>
          <Typography.Text strong>Law</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>Faculty of Law</Typography.Text>
        </Flex>
        <Tag color="blue">76</Tag>
      </Flex>
    ),
    onClick: () => {},
  },
];

const facultyAccordionItems = [
  {
    key: "f1", title: "Faculty of Sciences", subtitle: "4 departments · 350 students",
    extra: <Tag color="green">Active</Tag>,
    content: (
      <Flex vertical gap={8}>
        {(["Computer Science", "Mathematics", "Physics", "Chemistry"] as const).map((name, i) => (
          <Flex key={name} justify="space-between" align="center">
            <Typography.Text>{name}</Typography.Text>
            {i === 3
              ? <Tag color="default">No students</Tag>
              : <Tag color="blue">{[142, 89, 119][i]} students</Tag>}
          </Flex>
        ))}
      </Flex>
    ),
  },
  {
    key: "f2", title: "Faculty of Engineering", subtitle: "3 departments · 280 students",
    extra: <Tag color="green">Active</Tag>,
    content: (
      <Flex vertical gap={8}>
        {(["Civil Engineering", "Electrical Engineering", "Mechanical Engineering"] as const).map((name, i) => (
          <Flex key={name} justify="space-between" align="center">
            <Typography.Text>{name}</Typography.Text>
            <Tag color="blue">{[98, 102, 80][i]} students</Tag>
          </Flex>
        ))}
      </Flex>
    ),
  },
  {
    key: "f3", title: "Faculty of Health Sciences", subtitle: "2 departments · 344 students",
    extra: <Tag color="orange">Under Review</Tag>,
    content: (
      <Flex vertical gap={8}>
        <InlineStatus severity="warning" title="Accreditation review in progress" />
        {(["Medicine", "Nursing"] as const).map((name, i) => (
          <Flex key={name} justify="space-between" align="center">
            <Typography.Text>{name}</Typography.Text>
            <Tag color="blue">{[210, 134][i]} students</Tag>
          </Flex>
        ))}
      </Flex>
    ),
  },
  {
    key: "f4", title: "Faculty of Law", subtitle: "1 department · 76 students",
    extra: <Tag color="red">Inactive</Tag>,
    content: (
      <InlineStatus
        severity="error"
        title="Faculty suspended pending review"
        body="No new enrolments accepted until further notice."
      />
    ),
  },
];

const enrollmentAccordionItems = [
  {
    key: "e1", title: "Semester Registration", subtitle: "Closes in 3 days",
    content: (
      <Flex vertical gap={12}>
        <Flex justify="space-between">
          <Typography.Text>Registered</Typography.Text>
          <Typography.Text strong>842 / 1204</Typography.Text>
        </Flex>
        <Progress percent={70} strokeColor="#003049" />
        <InlineStatus severity="warning" title="30% of students have not registered" />
      </Flex>
    ),
  },
  {
    key: "e2", title: "Course Allocation", subtitle: "Completed",
    content: (
      <Flex vertical gap={12}>
        <Flex justify="space-between">
          <Typography.Text>Allocated</Typography.Text>
          <Typography.Text strong>1204 / 1204</Typography.Text>
        </Flex>
        <Progress percent={100} strokeColor="#28a745" />
        <InlineStatus severity="success" title="All students have been allocated courses" />
      </Flex>
    ),
  },
  {
    key: "e3", title: "Fee Payment", subtitle: "In progress",
    content: (
      <Flex vertical gap={12}>
        <Flex justify="space-between">
          <Typography.Text>Paid</Typography.Text>
          <Typography.Text strong>601 / 1204</Typography.Text>
        </Flex>
        <Progress percent={50} strokeColor="#ffc107" />
        <InlineStatus severity="info" title="Payment portal closes in 2 weeks" />
      </Flex>
    ),
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>(initialNotifications);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tourDone, setTourDone] = useState(false);
  const [rbacCalloutDismissed, setRbacCalloutDismissed] = useState(false);
  const [registrationCalloutDismissed, setRegistrationCalloutDismissed] = useState(false);

  // ── Tabs showcase state ──────────────────────────────────────────────────
  const [controlledTabKey, setControlledTabKey] = useState("overview");
  const [dynamicTabs, setDynamicTabs] = useState<TabItem[]>([
    { key: "dt1", label: "Tab 1", children: <Typography.Text>Content for Tab 1</Typography.Text>, closable: true },
    { key: "dt2", label: "Tab 2", children: <Typography.Text>Content for Tab 2</Typography.Text>, closable: true },
    { key: "dt3", label: "Tab 3", children: <Typography.Text>Content for Tab 3</Typography.Text>, closable: true },
  ]);
  const [dynamicTabCounter, setDynamicTabCounter] = useState(4);

  // ── Modal showcase state ─────────────────────────────────────────────────
  const [modalVariant, setModalVariant] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalDanger, setModalDanger] = useState(false);
  const [modalNoFooter, setModalNoFooter] = useState(false);
  const [modalCustomFooter, setModalCustomFooter] = useState(false);
  const [modalNoClose, setModalNoClose] = useState(false);
  const [modalNoConfirm, setModalNoConfirm] = useState(false);
  const [modalMobileFullscreen, setModalMobileFullscreen] = useState(false);

  const notificationsWithDismiss = notifications.map((n) => ({
    ...n,
    onDismiss: (id: string) => setNotifications((prev) => prev.filter((x) => x.id !== id)),
  }));

  return (
    <Flex vertical gap={24} style={{ padding: "0 4px" }}>

      {/* header */}
      <Flex justify="space-between" align="center" wrap gap={8}>
        <Flex align="center" gap={10}>
          <Typography.Title level={4} style={{ margin: 0 }}>Dashboard</Typography.Title>
          <ExplainerBadge variant="updated" />
        </Flex>
        <Flex align="center" gap={8}>
          {!tourDone && (
            <Button
              size="small"
              type="link"
              onClick={() => { setTourStep(0); setTourDone(false); }}
            >
              Take a tour
            </Button>
          )}
          <Badge count={notifications.length} size="small">
            <Button icon={<BellOutlined />}>Notifications</Button>
          </Badge>
        </Flex>
      </Flex>

      {/* ── Walkthrough spotlight — shown until dismissed ── */}
      {!tourDone && (
        <ExplainerSpotlight
          intent="info"
          steps={tourSteps}
          step={tourStep}
          onStepChange={setTourStep}
          onFinish={() => setTourDone(true)}
          size="md"
          style={{ maxWidth: "100%" }}
        />
      )}

      {/* ── 1. DashCard — size / variant / density combos ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <DashCard
            title={
              <ExplainerTooltip intent="info" title="Total Students"
                body="Counts all currently enrolled students across all programs and levels.">
                <Flex align="center" gap={4}>
                  <Typography.Text strong>Students</Typography.Text>
                  <QuestionCircleOutlined style={{ fontSize: 12, opacity: 0.5 }} />
                </Flex>
              </ExplainerTooltip>
            }
            meta="Total enrolled" value={1_204}
            trend="↑ 48 this semester" icon={<UserOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashCard
            title={
              <ExplainerTooltip intent="tip" title="Active Staff"
                body="Includes lecturers, HODs, deans, and admin staff currently on active duty.">
                <Flex align="center" gap={4}>
                  <Typography.Text strong>Staff</Typography.Text>
                  <QuestionCircleOutlined style={{ fontSize: 12, opacity: 0.5 }} />
                </Flex>
              </ExplainerTooltip>
            }
            meta="Active members" value={87}
            trend={<Typography.Text type="success"><ArrowUpOutlined /> 3 new this month</Typography.Text>}
            icon={<TeamOutlined />} variant="filled" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashCard
            title={
              <Flex align="center" gap={4}>
                <Typography.Text strong>Departments</Typography.Text>
                <ExplainerBadge dot intent="info" />
              </Flex>
            }
            meta="Across all faculties" value={14}
            trend={<Typography.Text type="secondary"><ArrowDownOutlined /> 0 change</Typography.Text>}
            icon={<ApartmentOutlined />} size="sm" density="compact" variant="outlined" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashCard
            title={
              <Flex align="center" gap={6}>
                <Typography.Text strong>Faculties</Typography.Text>
                <ExplainerBadge variant="beta" />
              </Flex>
            }
            meta="Active faculties" value={5}
            icon={<BookOutlined />} size="lg" density="spacious" variant="ghost"
            footer={<Typography.Text type="secondary" style={{ fontSize: 12 }}>Updated: April 2, 2026</Typography.Text>} />
        </Col>
      </Row>

      {/* Callout: RBAC enforcement notice — dismissible */}
      {!rbacCalloutDismissed && (
        <ExplainerCallout
          intent="new"
          title="Role-based access control is now active"
          body="Your dashboard and navigation are now filtered by your assigned permissions. Some sections may not be visible depending on your role."
          dismissible
          collapsible
          onDismiss={() => setRbacCalloutDismissed(true)}
          action={
            <Button size="small" type="link" style={{ padding: 0 }}>
              Learn about permissions →
            </Button>
          }
        />
      )}

      {/* ── 2. InlineStatus — all 4 severities ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <InlineStatus severity="error" title="Server error on student portal"
            body="503 responses detected on /api/students. Engineering team notified."
            icon={<ExclamationCircleOutlined />} timestamp="2 min ago"
            action={<Button size="small" danger>View Logs</Button>} />
        </Col>
        <Col xs={24} md={12}>
          <InlineStatus severity="warning" title="Semester registration closes in 3 days"
            body="362 students have not yet registered for courses."
            icon={<WarningOutlined />} timestamp="Updated: April 2, 2026" />
        </Col>
        <Col xs={24} md={12}>
          <InlineStatus severity="success" title="Grading export complete"
            body="200 score sheets exported and sent to the registry."
            icon={<CheckCircleOutlined />} timestamp="3 hr ago" />
        </Col>
        <Col xs={24} md={12}>
          <InlineStatus severity="info" title="System maintenance scheduled"
            body="Portal will be offline on April 5, 2026 from 02:00–04:00 UTC."
            icon={<InfoCircleOutlined />} liveMode="polite" />
        </Col>
      </Row>

      {/* ── 3. NotificationTray — flat vs grouped ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Panel title="Notifications — flat" subtitle="Dismiss to clear" size="md">
            <NotificationTray notifications={notificationsWithDismiss}
              mode="flat" maxHeight={280} emptyState="You're all caught up" />
          </Panel>
        </Col>
        <Col xs={24} md={12}>
          <Panel title="Notifications — grouped" subtitle="Grouped by category" size="md">
            <NotificationTray notifications={notificationsWithDismiss}
              mode="grouped" maxHeight={280} emptyState="No notifications" />
          </Panel>
        </Col>
      </Row>

      {/* ── 4. Card — all variants × states ── */}
      <Panel title="Card Variants & States"
        subtitle="default · filled · outlined · ghost  ×  default · loading · disabled · readonly"
        collapsible defaultCollapsed={false} size="md">
        <Row gutter={[16, 16]}>
          {([
            { header: "Default", sub: "variant=default", variant: "default" as const, state: "default" as const },
            { header: "Filled", sub: "variant=filled", variant: "filled" as const, state: "default" as const },
            { header: "Outlined", sub: "variant=outlined", variant: "outlined" as const, state: "default" as const },
            { header: "Ghost", sub: "variant=ghost", variant: "ghost" as const, state: "default" as const },
            { header: "Loading", sub: "state=loading", variant: "default" as const, state: "loading" as const },
            { header: "Disabled", sub: "state=disabled", variant: "default" as const, state: "disabled" as const },
            { header: "Read-only", sub: "state=readonly", variant: "default" as const, state: "readonly" as const },
          ]).map(({ header, sub, variant, state }) => (
            <Col key={header} xs={24} sm={12} lg={6}>
              <Card header={header} subheader={sub} size="sm" variant={variant} state={state}>
                <Typography.Text type="secondary">Card body content.</Typography.Text>
              </Card>
            </Col>
          ))}
          <Col xs={24} sm={12} lg={6}>
            <Card header="With Footer" subheader="footer prop" size="sm"
              footer={<Typography.Text type="secondary" style={{ fontSize: 12 }}>Last modified: April 2, 2026</Typography.Text>}>
              <Typography.Text type="secondary">Card with a footer divider.</Typography.Text>
            </Card>
          </Col>
        </Row>
      </Panel>

      {/* ── 5. Panel — controlled collapsible ── */}
      <Panel
        title={
          <Flex align="center" gap={8}>
            <Typography.Text strong>Semester Overview</Typography.Text>
            <ExplainerTooltip
              intent="tip"
              title="Controlled panel"
              body="Click Collapse/Expand to toggle this panel. The state is managed externally via React state."
              placement="right"
            >
              <QuestionCircleOutlined style={{ fontSize: 13, opacity: 0.45 }} />
            </ExplainerTooltip>
          </Flex>
        }
        subtitle="Controlled collapsible panel"
        collapsible collapsed={panelCollapsed} onCollapseChange={setPanelCollapsed}
        size="md"
        actions={<Tag color={panelCollapsed ? "default" : "blue"}>{panelCollapsed ? "Collapsed" : "Expanded"}</Tag>}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <DashCard title="Registered" value="842 / 1204" trend="70% completion" size="sm" density="compact" />
          </Col>
          <Col xs={24} md={8}>
            <DashCard title="Courses Allocated" value="1204 / 1204" trend="100% complete"
              size="sm" density="compact" variant="filled" />
          </Col>
          <Col xs={24} md={8}>
            <DashCard title="Fees Paid" value="601 / 1204" trend="50% completion"
              size="sm" density="compact" variant="outlined" />
          </Col>
        </Row>
      </Panel>

      {/* ── 6. Accordion — single vs multiple, ghost variant ── */}
      {/* Tip callout: registration deadline — dismissible */}
      {!registrationCalloutDismissed && (
        <ExplainerCallout
          intent="warning"
          title="Semester registration closes in 3 days"
          body="362 students have not yet completed course registration. Expand the Enrollment Progress section below to review."
          dismissible
          onDismiss={() => setRegistrationCalloutDismissed(true)}
          action={<Button size="small" danger>Send reminder</Button>}
        />
      )}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Panel
            title={
              <Flex align="center" gap={8}>
                <Typography.Text strong>Faculties</Typography.Text>
                <ExplainerBadge variant="new" />
              </Flex>
            }
            subtitle="expansionMode=single" size="md">
            <Accordion items={facultyAccordionItems} expansionMode="single" defaultActiveKeys={["f1"]} />
          </Panel>
        </Col>
        <Col xs={24} md={12}>
          <Panel
            title={
              <Flex align="center" gap={8}>
                <Typography.Text strong>Enrollment Progress</Typography.Text>
                <ExplainerTooltip
                  intent="info"
                  title="Enrollment Progress"
                  body="Tracks registration, course allocation, and fee payment completion rates for the current semester."
                  placement="top"
                >
                  <QuestionCircleOutlined style={{ fontSize: 13, opacity: 0.45 }} />
                </ExplainerTooltip>
              </Flex>
            }
            subtitle="expansionMode=multiple, variant=ghost" size="md">
            <Accordion items={enrollmentAccordionItems} expansionMode="multiple"
              defaultActiveKeys={["e1", "e3"]} variant="ghost" />
          </Panel>
        </Col>
      </Row>

      {/* ── 7. ResponsiveCollapsibleGrid — collapses to Accordion below lg ── */}
      <ResponsiveCollapsibleGrid collapseBelow="lg" desktopGutter={[16, 16]}
        mobileExpansionMode="single" defaultMobileExpandedKeys={["students"]}
        mobileAriaLabel="Student and staff data"
        sections={[
          {
            key: "students", title: "Recent Students", subtitle: "Last 5 enrolments",
            desktopColProps: { span: 14 },
            content: (
              <Table
                header={{ title: "Recent Students", subtitle: "Last 5 enrolments",
                  extra: <Button size="small" icon={<FileTextOutlined />}>Export</Button> }}
                dataSource={recentStudents} columns={studentColumns}
                pagination={false} size="sm" density="comfortable" />
            ),
          },
          {
            key: "staff", title: "Staff", subtitle: "Active staff members",
            desktopColProps: { span: 10 },
            content: (
              <Table header={{ title: "Staff", subtitle: "Active staff members" }}
                dataSource={staffList} columns={staffColumns}
                pagination={false} size="sm" density="compact" />
            ),
          },
        ]} />

      {/* ── 8. Table — loading state + custom empty state ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Table header={{ title: "Loading State", subtitle: "state=loading" }}
            dataSource={[]} columns={studentColumns} pagination={false}
            size="sm" state="loading" />
        </Col>
        <Col xs={24} md={12}>
          <Table
            header={{ title: "Empty State", subtitle: "Custom empty message",
              extra: <Button size="small" type="primary">Add Student</Button> }}
            dataSource={[]} columns={studentColumns} pagination={false} size="sm"
            emptyState={{
              title: "No students found",
              description: "Add a student to get started.",
              action: <Button type="primary" size="small">Add Student</Button>,
            }} />
        </Col>
      </Row>

      {/* ── 9. ItemList — simple / media / navigation variants ── */}
      <ExplainerCallout
        intent="tip"
        title="Three ways to display lists"
        body="simple — plain rows with optional leading icon.  media — larger avatar-style leading slot.  navigation — adds a chevron and makes each row clickable."
        collapsible
        defaultCollapsed={false}
        size="sm"
      />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Panel
            title={
              <Flex align="center" gap={8}>
                <Typography.Text strong>Top Students</Typography.Text>
                <ExplainerTooltip intent="tip" title="GPA Leaderboard"
                  body="Ranked by cumulative GPA for the current academic year. Updates after each grading cycle.">
                  <QuestionCircleOutlined style={{ fontSize: 13, opacity: 0.45 }} />
                </ExplainerTooltip>
              </Flex>
            }
            subtitle="variant=simple" size="md">
            <ItemList items={topStudentItems} variant="simple"
              density="comfortable" aria-label="Top students by GPA" />
          </Panel>
        </Col>
        <Col xs={24} md={8}>
          <Panel title="Staff Directory" subtitle="variant=media" size="md">
            <ItemList variant="media" density="comfortable" aria-label="Staff directory"
              items={staffList.map((s) => ({
                key: s.key,
                leading: <Avatar style={{ background: "#003049" }}>{s.name[0]}</Avatar>,
                content: (
                  <Flex vertical gap={2}>
                    <Typography.Text strong>{s.name}</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {s.role} · {s.department}
                    </Typography.Text>
                  </Flex>
                ),
                trailing: <Tag color={s.status === "Active" ? "green" : "gold"}>{s.status}</Tag>,
              }))} />
          </Panel>
        </Col>
        <Col xs={24} md={8}>
          <Panel title="Departments" subtitle="variant=navigation" size="md">
            <ItemList variant="navigation" density="comfortable" aria-label="Department navigation"
              items={departmentNavItems}
              onItemClick={(item) => console.log("Navigate to", item.key)} />
          </Panel>
        </Col>
      </Row>

      {/* ── 10. ItemList — bordered=false, empty state, disabled state ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Panel title="No Border / No Split" subtitle="bordered=false, split=false" size="md" variant="outlined">
            <ItemList bordered={false} split={false} density="compact"
              items={[
                { key: "i1", leading: <SettingOutlined />, content: "System Configuration" },
                { key: "i2", leading: <UserOutlined />, content: "User Management" },
                { key: "i3", leading: <BookOutlined />, content: "Academic Records" },
              ]} />
          </Panel>
        </Col>
        <Col xs={24} md={8}>
          <Panel title="Empty List" subtitle="Custom empty state" size="md">
            <ItemList items={[]}
              emptyState={
                <Flex vertical align="center" gap={4}>
                  <Typography.Text type="secondary">No departments assigned</Typography.Text>
                  <Button size="small" type="link">Add Department</Button>
                </Flex>
              } />
          </Panel>
        </Col>
        <Col xs={24} md={8}>
          <Panel title="Disabled List" subtitle="state=disabled" size="md">
            <ExplainerCallout
              intent="beta"
              title="Approval workflow coming soon"
              body="Items in this list will be actionable once the approval module is released."
              size="sm"
            />
            <div style={{ marginTop: 12 }}>
              <ItemList state="disabled"
                items={[
                  { key: "x1", leading: <ClockCircleOutlined />, content: "Pending approval" },
                  { key: "x2", leading: <ClockCircleOutlined />, content: "Awaiting review" },
                ]} />
            </div>
          </Panel>
        </Col>
      </Row>

      {/* ── 11. Tabs — all variants, sizes, states, orientations, edge cases ── */}
      <Panel
        title={
          <Flex align="center" gap={8}>
            <Typography.Text strong>Tabs Component</Typography.Text>
            <ExplainerBadge variant="new" />
          </Flex>
        }
        subtitle="All variants · sizes · states · orientations · edge cases"
        collapsible defaultCollapsed={false} size="md"
      >
        <Flex vertical gap={32}>

          {/* 11a. Variants */}
          <Flex vertical gap={8}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>VARIANTS</Typography.Text>
            <Row gutter={[16, 24]}>
              {(["default", "filled", "outlined", "ghost"] as const).map((v) => (
                <Col key={v} xs={24} md={12}>
                  <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>{v}</Typography.Text>
                  <Tabs
                    variant={v}
                    style={{ marginTop: 4 }}
                    items={[
                      { key: "a", label: "Overview", children: <Typography.Text>Overview panel — variant: {v}</Typography.Text> },
                      { key: "b", label: "Analytics", children: <Typography.Text>Analytics panel — variant: {v}</Typography.Text> },
                      { key: "c", label: "Settings", children: <Typography.Text>Settings panel — variant: {v}</Typography.Text> },
                    ]}
                  />
                </Col>
              ))}
            </Row>
          </Flex>

          {/* 11b. Sizes */}
          <Flex vertical gap={8}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>SIZES</Typography.Text>
            <Row gutter={[16, 24]}>
              {(["sm", "md", "lg"] as const).map((sz) => (
                <Col key={sz} xs={24} md={8}>
                  <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>size={sz}</Typography.Text>
                  <Tabs
                    size={sz}
                    style={{ marginTop: 4 }}
                    items={[
                      { key: "a", label: "Tab A", children: <Typography.Text>Panel A — size: {sz}</Typography.Text> },
                      { key: "b", label: "Tab B", children: <Typography.Text>Panel B — size: {sz}</Typography.Text> },
                    ]}
                  />
                </Col>
              ))}
            </Row>
          </Flex>

          {/* 11c. Density */}
          <Flex vertical gap={8}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>DENSITY</Typography.Text>
            <Row gutter={[16, 24]}>
              {(["compact", "comfortable", "spacious"] as const).map((d) => (
                <Col key={d} xs={24} md={8}>
                  <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>density={d}</Typography.Text>
                  <Tabs
                    density={d}
                    style={{ marginTop: 4 }}
                    items={[
                      { key: "a", label: "Tab A", children: <Typography.Text>Panel A — density: {d}</Typography.Text> },
                      { key: "b", label: "Tab B", children: <Typography.Text>Panel B — density: {d}</Typography.Text> },
                    ]}
                  />
                </Col>
              ))}
            </Row>
          </Flex>

          {/* 11d. Icons + Badges */}
          <Flex vertical gap={8}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>ICONS & BADGES</Typography.Text>
            <Tabs
              items={[
                {
                  key: "students",
                  label: "Students",
                  icon: <UserOutlined />,
                  badge: 12,
                  children: <Typography.Text>Students panel — badge count: 12</Typography.Text>,
                },
                {
                  key: "staff",
                  label: "Staff",
                  icon: <TeamOutlined />,
                  badge: "dot",
                  children: <Typography.Text>Staff panel — badge: dot</Typography.Text>,
                },
                {
                  key: "departments",
                  label: "Departments",
                  icon: <ApartmentOutlined />,
                  badge: 0,
                  children: <Typography.Text>Departments panel — badge: 0 (no badge rendered)</Typography.Text>,
                },
                {
                  key: "reports",
                  label: "Reports",
                  icon: <FileTextOutlined />,
                  children: <Typography.Text>Reports panel — no badge</Typography.Text>,
                },
              ]}
            />
          </Flex>

          {/* 11e. States */}
          <Flex vertical gap={8}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>STATES</Typography.Text>
            <Row gutter={[16, 24]}>
              <Col xs={24} md={8}>
                <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>state=loading</Typography.Text>
                <Tabs
                  state="loading"
                  style={{ marginTop: 4 }}
                  items={[
                    { key: "a", label: "Overview", children: <Typography.Text>This is hidden by the loading overlay</Typography.Text> },
                    { key: "b", label: "Analytics", children: <Typography.Text>Also hidden</Typography.Text> },
                  ]}
                />
              </Col>
              <Col xs={24} md={8}>
                <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>state=error</Typography.Text>
                <Tabs
                  state="error"
                  style={{ marginTop: 4 }}
                  items={[
                    { key: "a", label: "Overview", children: <Typography.Text>Hidden by error overlay</Typography.Text> },
                    { key: "b", label: "Analytics", children: <Typography.Text>Also hidden</Typography.Text> },
                  ]}
                />
              </Col>
              <Col xs={24} md={8}>
                <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>state=disabled (all tabs)</Typography.Text>
                <Tabs
                  state="disabled"
                  style={{ marginTop: 4 }}
                  items={[
                    { key: "a", label: "Overview", children: <Typography.Text>Panel A</Typography.Text> },
                    { key: "b", label: "Analytics", children: <Typography.Text>Panel B</Typography.Text> },
                  ]}
                />
              </Col>
            </Row>
          </Flex>

          {/* 11f. Individual disabled tab */}
          <Flex vertical gap={8}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>INDIVIDUAL DISABLED TAB</Typography.Text>
            <Tabs
              items={[
                { key: "a", label: "Active Tab", children: <Typography.Text>This tab is active and enabled.</Typography.Text> },
                { key: "b", label: "Disabled Tab", disabled: true, children: <Typography.Text>You cannot reach this panel.</Typography.Text> },
                { key: "c", label: "Another Active", children: <Typography.Text>This tab is also enabled.</Typography.Text> },
              ]}
            />
          </Flex>

          {/* 11g. Controlled mode */}
          <Flex vertical gap={8}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>CONTROLLED MODE</Typography.Text>
            <Flex gap={8} wrap style={{ marginBottom: 8 }}>
              {(["overview", "students", "staff", "reports"] as const).map((k) => (
                <Button
                  key={k}
                  size="small"
                  type={controlledTabKey === k ? "primary" : "default"}
                  onClick={() => setControlledTabKey(k)}
                >
                  {k}
                </Button>
              ))}
            </Flex>
            <Tabs
              activeKey={controlledTabKey}
              onChange={setControlledTabKey}
              items={[
                { key: "overview", label: "Overview", children: <Typography.Text>Overview — controlled via external buttons above.</Typography.Text> },
                { key: "students", label: "Students", children: <Typography.Text>Students — activeKey: {controlledTabKey}</Typography.Text> },
                { key: "staff", label: "Staff", children: <Typography.Text>Staff — activeKey: {controlledTabKey}</Typography.Text> },
                { key: "reports", label: "Reports", children: <Typography.Text>Reports — activeKey: {controlledTabKey}</Typography.Text> },
              ]}
            />
          </Flex>

          {/* 11h. Closable + Addable (dynamic tabs) */}
          <Flex vertical gap={8}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>CLOSABLE + ADDABLE (DYNAMIC TABS)</Typography.Text>
            <Tabs
              addable
              onAdd={() => {
                const key = `dt${dynamicTabCounter}`;
                setDynamicTabs((prev) => [
                  ...prev,
                  {
                    key,
                    label: `Tab ${dynamicTabCounter}`,
                    children: <Typography.Text>Content for Tab {dynamicTabCounter}</Typography.Text>,
                    closable: true,
                  },
                ]);
                setDynamicTabCounter((n) => n + 1);
              }}
              onClose={(key) => setDynamicTabs((prev) => prev.filter((t) => t.key !== key))}
              items={dynamicTabs}
            />
          </Flex>

          {/* 11i. Extra content slot */}
          <Flex vertical gap={8}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>EXTRA CONTENT SLOT</Typography.Text>
            <Row gutter={[16, 24]}>
              <Col xs={24} md={12}>
                <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>extra = ReactNode (trailing)</Typography.Text>
                <Tabs
                  style={{ marginTop: 4 }}
                  extra={<Button size="small" icon={<SettingOutlined />}>Settings</Button>}
                  items={[
                    { key: "a", label: "Tab A", children: <Typography.Text>Panel A — extra button at trailing end.</Typography.Text> },
                    { key: "b", label: "Tab B", children: <Typography.Text>Panel B</Typography.Text> },
                  ]}
                />
              </Col>
              <Col xs={24} md={12}>
                <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>extra = {"{ left, right }"}</Typography.Text>
                <Tabs
                  style={{ marginTop: 4 }}
                  extra={{
                    left: <Button size="small" icon={<ArrowUpOutlined />} style={{ marginRight: 8 }}>Left</Button>,
                    right: <Button size="small" icon={<ArrowDownOutlined />}>Right</Button>,
                  }}
                  items={[
                    { key: "a", label: "Tab A", children: <Typography.Text>Panel A — extra on both sides.</Typography.Text> },
                    { key: "b", label: "Tab B", children: <Typography.Text>Panel B</Typography.Text> },
                  ]}
                />
              </Col>
            </Row>
          </Flex>

          {/* 11j. Orientation */}
          <Flex vertical gap={8}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>ORIENTATION (tabPosition)</Typography.Text>
            <Row gutter={[16, 24]}>
              {(["top", "bottom", "left", "right"] as const).map((pos) => (
                <Col key={pos} xs={24} md={12}>
                  <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>tabPosition={pos}</Typography.Text>
                  <Tabs
                    tabPosition={pos}
                    style={{ marginTop: 4, minHeight: 120 }}
                    items={[
                      { key: "a", label: "Tab A", children: <Typography.Text>Panel A — tabPosition: {pos}</Typography.Text> },
                      { key: "b", label: "Tab B", children: <Typography.Text>Panel B</Typography.Text> },
                      { key: "c", label: "Tab C", children: <Typography.Text>Panel C</Typography.Text> },
                    ]}
                  />
                </Col>
              ))}
            </Row>
          </Flex>

          {/* 11k. Edge cases */}
          <Flex vertical gap={8}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>EDGE CASES</Typography.Text>
            <Row gutter={[16, 24]}>
              <Col xs={24} md={8}>
                <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>All tabs disabled (first non-disabled auto-selected)</Typography.Text>
                <Tabs
                  style={{ marginTop: 4 }}
                  items={[
                    { key: "a", label: "Disabled", disabled: true, children: <Typography.Text>Panel A</Typography.Text> },
                    { key: "b", label: "Disabled", disabled: true, children: <Typography.Text>Panel B</Typography.Text> },
                    { key: "c", label: "Active", children: <Typography.Text>First non-disabled tab is auto-selected.</Typography.Text> },
                  ]}
                />
              </Col>
              <Col xs={24} md={8}>
                <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>Empty items array</Typography.Text>
                <Tabs style={{ marginTop: 4 }} items={[]} />
              </Col>
              <Col xs={24} md={8}>
                <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>No children (label-only tabs)</Typography.Text>
                <Tabs
                  style={{ marginTop: 4 }}
                  items={[
                    { key: "a", label: "No Panel A" },
                    { key: "b", label: "No Panel B" },
                  ]}
                />
              </Col>
            </Row>
          </Flex>

        </Flex>
      </Panel>

      {/* ── 12. Modal — all variants, sizes, density, states, edge cases ── */}
      <Panel
        title={
          <Flex align="center" gap={8}>
            <Typography.Text strong>Modal Component</Typography.Text>
            <ExplainerBadge variant="new" />
          </Flex>
        }
        subtitle="All variants · sizes · density · states · footer slots · edge cases"
        collapsible defaultCollapsed={false} size="md"
      >
        <Flex vertical gap={32}>

          {/* 12a. Variants */}
          <Flex vertical gap={8}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>VARIANTS</Typography.Text>
            <Flex gap={8} wrap>
              {(["default", "filled", "outlined", "ghost"] as const).map((v) => (
                <Button key={v} size="small" onClick={() => setModalVariant(v)}>
                  variant={v}
                </Button>
              ))}
            </Flex>
            {(["default", "filled", "outlined", "ghost"] as const).map((v) => (
              <Modal
                key={v}
                open={modalVariant === v}
                title={`Modal — variant: ${v}`}
                variant={v}
                onClose={() => setModalVariant(null)}
                onConfirm={() => setModalVariant(null)}
                confirmLabel="Confirm"
                cancelLabel="Cancel"
                destroyOnHidden
              >
                <Typography.Text>
                  This modal uses <Typography.Text code>variant="{v}"</Typography.Text>. The surface background and border treatment follow the ui-kit variant system.
                </Typography.Text>
              </Modal>
            ))}
          </Flex>

          {/* 12b. Sizes */}
          <Flex vertical gap={8}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>SIZES</Typography.Text>
            <Flex gap={8} wrap>
              {(["sm", "md", "lg"] as const).map((sz) => (
                <Button key={sz} size="small" onClick={() => setModalVariant(`size-${sz}`)}>
                  size={sz}
                </Button>
              ))}
            </Flex>
            {(["sm", "md", "lg"] as const).map((sz) => (
              <Modal
                key={sz}
                open={modalVariant === `size-${sz}`}
                title={`Modal — size: ${sz}`}
                size={sz}
                onClose={() => setModalVariant(null)}
                onConfirm={() => setModalVariant(null)}
                confirmLabel="Confirm"
                destroyOnHidden
              >
                <Typography.Text>
                  Width: <Typography.Text code>{sz === "sm" ? "400px" : sz === "md" ? "520px" : "720px"}</Typography.Text>
                </Typography.Text>
              </Modal>
            ))}
          </Flex>

          {/* 12c. Density */}
          <Flex vertical gap={8}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>DENSITY</Typography.Text>
            <Flex gap={8} wrap>
              {(["compact", "comfortable", "spacious"] as const).map((d) => (
                <Button key={d} size="small" onClick={() => setModalVariant(`density-${d}`)}>
                  density={d}
                </Button>
              ))}
            </Flex>
            {(["compact", "comfortable", "spacious"] as const).map((d) => (
              <Modal
                key={d}
                open={modalVariant === `density-${d}`}
                title={`Modal — density: ${d}`}
                density={d}
                onClose={() => setModalVariant(null)}
                onConfirm={() => setModalVariant(null)}
                confirmLabel="Confirm"
                destroyOnHidden
              >
                <Typography.Text>
                  Header and body padding driven by <Typography.Text code>toSpacingUnit("{d}")</Typography.Text>.
                </Typography.Text>
              </Modal>
            ))}
          </Flex>

          {/* 12d. Loading state */}
          <Flex vertical gap={8}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>LOADING STATE</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              When <Typography.Text code>state="loading"</Typography.Text>, the primary button shows a spinner, both buttons are disabled, and the close button + overlay click are suppressed — regardless of <Typography.Text code>closable</Typography.Text> / <Typography.Text code>maskClosable</Typography.Text> prop values.
            </Typography.Text>
            <Flex gap={8} wrap>
              <Button size="small" onClick={() => { setModalLoading(true); setModalVariant("loading"); }}>
                Open loading modal
              </Button>
            </Flex>
            <Modal
              open={modalVariant === "loading"}
              title="Saving changes…"
              state={modalLoading ? "loading" : "default"}
              onClose={() => { setModalVariant(null); setModalLoading(false); }}
              onConfirm={() => {
                // simulate async op — auto-close after 2s
                setTimeout(() => { setModalVariant(null); setModalLoading(false); }, 2000);
              }}
              confirmLabel="Save"
              cancelLabel="Cancel"
              closable
              maskClosable
              destroyOnHidden
            >
              <Typography.Text>
                The modal is in <Typography.Text code>state="loading"</Typography.Text>. Close button and overlay click are disabled. Both buttons are disabled. The primary button shows a spinner.
              </Typography.Text>
            </Modal>
          </Flex>

          {/* 12e. Danger variant */}
          <Flex vertical gap={8}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>DANGER</Typography.Text>
            <Flex gap={8} wrap>
              <Button size="small" danger onClick={() => { setModalDanger(true); setModalVariant("danger"); }}>
                Open danger modal
              </Button>
            </Flex>
            <Modal
              open={modalVariant === "danger"}
              title="Delete student record?"
              danger={modalDanger}
              onClose={() => { setModalVariant(null); setModalDanger(false); }}
              onConfirm={() => { setModalVariant(null); setModalDanger(false); }}
              confirmLabel="Delete"
              cancelLabel="Cancel"
              destroyOnHidden
            >
              <Typography.Text>
                This action is irreversible. The primary action button renders with <Typography.Text code>danger=true</Typography.Text> styling.
              </Typography.Text>
            </Modal>
          </Flex>

          {/* 12f. Footer slot edge cases */}
          <Flex vertical gap={8}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>FOOTER LAYOUT & SLOT EDGE CASES</Typography.Text>
            <Row gutter={[8, 8]}>
              <Col>
                <Button size="small" onClick={() => setModalVariant("footer-horizontal")}>
                  footerLayout=horizontal (default)
                </Button>
              </Col>
              <Col>
                <Button size="small" onClick={() => setModalVariant("footer-vertical")}>
                  footerLayout=vertical
                </Button>
              </Col>
              <Col>
                <Button size="small" onClick={() => { setModalNoConfirm(true); setModalVariant("no-confirm"); }}>
                  No onConfirm (no footer)
                </Button>
              </Col>
              <Col>
                <Button size="small" onClick={() => { setModalNoFooter(true); setModalVariant("null-footer"); }}>
                  footer=null (suppress footer)
                </Button>
              </Col>
              <Col>
                <Button size="small" onClick={() => { setModalCustomFooter(true); setModalVariant("custom-footer"); }}>
                  Custom footer ReactNode
                </Button>
              </Col>
            </Row>

            {/* Horizontal layout (default) */}
            <Modal
              open={modalVariant === "footer-horizontal"}
              title="Horizontal footer (default)"
              footerLayout="horizontal"
              onClose={() => setModalVariant(null)}
              onConfirm={() => setModalVariant(null)}
              confirmLabel="Confirm"
              cancelLabel="Cancel"
              destroyOnHidden
            >
              <Typography.Text>
                <Typography.Text code>footerLayout="horizontal"</Typography.Text> — buttons are side-by-side, right-aligned. This is the default.
              </Typography.Text>
            </Modal>

            {/* Vertical layout */}
            <Modal
              open={modalVariant === "footer-vertical"}
              title="Vertical footer"
              footerLayout="vertical"
              onClose={() => setModalVariant(null)}
              onConfirm={() => setModalVariant(null)}
              confirmLabel="Confirm"
              cancelLabel="Cancel"
              destroyOnHidden
            >
              <Typography.Text>
                <Typography.Text code>footerLayout="vertical"</Typography.Text> — buttons are stacked full-width, confirm on top.
              </Typography.Text>
            </Modal>

            {/* No onConfirm → no footer rendered */}
            <Modal
              open={modalVariant === "no-confirm" && modalNoConfirm}
              title="No footer (onConfirm absent)"
              onClose={() => { setModalVariant(null); setModalNoConfirm(false); }}
              destroyOnHidden
            >
              <Typography.Text>
                No <Typography.Text code>onConfirm</Typography.Text> prop was passed. <Typography.Text code>buildDefaultFooter</Typography.Text> returns <Typography.Text code>null</Typography.Text> — no footer is rendered.
              </Typography.Text>
            </Modal>

            {/* footer={null} → footer suppressed */}
            <Modal
              open={modalVariant === "null-footer" && modalNoFooter}
              title="Footer suppressed (footer=null)"
              footer={null}
              onClose={() => { setModalVariant(null); setModalNoFooter(false); }}
              onConfirm={() => { setModalVariant(null); setModalNoFooter(false); }}
              destroyOnHidden
            >
              <Typography.Text>
                <Typography.Text code>footer={"{null}"}</Typography.Text> explicitly suppresses the footer even though <Typography.Text code>onConfirm</Typography.Text> is provided.
              </Typography.Text>
            </Modal>

            {/* Custom footer ReactNode */}
            <Modal
              open={modalVariant === "custom-footer" && modalCustomFooter}
              title="Custom footer slot"
              footer={
                <Flex justify="flex-end" gap={8} style={{ padding: "12px 24px", borderTop: "1px solid #f0f0f0" }}>
                  <Button onClick={() => { setModalVariant(null); setModalCustomFooter(false); }}>
                    Dismiss
                  </Button>
                  <Button type="primary" onClick={() => { setModalVariant(null); setModalCustomFooter(false); }}>
                    Custom Action
                  </Button>
                </Flex>
              }
              onClose={() => { setModalVariant(null); setModalCustomFooter(false); }}
              destroyOnHidden
            >
              <Typography.Text>
                A custom <Typography.Text code>footer</Typography.Text> ReactNode replaces the default stacked button layout entirely.
              </Typography.Text>
            </Modal>
          </Flex>

          {/* 12g. Closable / maskClosable */}
          <Flex vertical gap={8}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>CLOSABLE / MASK CLOSABLE</Typography.Text>
            <Flex gap={8} wrap>
              <Button size="small" onClick={() => { setModalNoClose(true); setModalVariant("no-close"); }}>
                closable=false, maskClosable=false
              </Button>
            </Flex>
            <Modal
              open={modalVariant === "no-close" && modalNoClose}
              title="Cannot be dismissed by UI"
              closable={false}
              maskClosable={false}
              onClose={() => { setModalVariant(null); setModalNoClose(false); }}
              onConfirm={() => { setModalVariant(null); setModalNoClose(false); }}
              confirmLabel="OK, close it"
              cancelLabel="Cancel"
              destroyOnHidden
            >
              <Typography.Text>
                <Typography.Text code>closable=false</Typography.Text> hides the × button. <Typography.Text code>maskClosable=false</Typography.Text> prevents overlay-click dismissal. Only the footer buttons can close this modal.
              </Typography.Text>
            </Modal>
          </Flex>

          {/* 12h. Mobile fullscreen */}
          <Flex vertical gap={8}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>MOBILE FULLSCREEN</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              On xs viewports the modal renders as a bottom sheet. <Typography.Text code>mobileFullscreen=true</Typography.Text> expands the body to <Typography.Text code>100vh</Typography.Text> instead of <Typography.Text code>70vh</Typography.Text>.
            </Typography.Text>
            <Flex gap={8} wrap>
              <Button size="small" onClick={() => { setModalMobileFullscreen(false); setModalVariant("mobile-sheet"); }}>
                Bottom sheet (70vh body)
              </Button>
              <Button size="small" onClick={() => { setModalMobileFullscreen(true); setModalVariant("mobile-fullscreen"); }}>
                mobileFullscreen (100vh body)
              </Button>
            </Flex>
            <Modal
              open={modalVariant === "mobile-sheet"}
              title="Bottom sheet (resize to xs to see)"
              mobileFullscreen={false}
              onClose={() => setModalVariant(null)}
              onConfirm={() => setModalVariant(null)}
              confirmLabel="Got it"
              destroyOnHidden
            >
              <Typography.Text>
                On a viewport ≤ 480px this modal slides up from the bottom with rounded top corners and a <Typography.Text code>max-height: 70vh</Typography.Text> scrollable body.
              </Typography.Text>
            </Modal>
            <Modal
              open={modalVariant === "mobile-fullscreen"}
              title="Fullscreen sheet (resize to xs to see)"
              mobileFullscreen={modalMobileFullscreen}
              onClose={() => { setModalVariant(null); setModalMobileFullscreen(false); }}
              onConfirm={() => { setModalVariant(null); setModalMobileFullscreen(false); }}
              confirmLabel="Got it"
              destroyOnHidden
            >
              <Typography.Text>
                On a viewport ≤ 480px with <Typography.Text code>mobileFullscreen=true</Typography.Text>, the body expands to <Typography.Text code>max-height: 100vh</Typography.Text>.
              </Typography.Text>
            </Modal>
          </Flex>

        </Flex>
      </Panel>

    </Flex>
  );
}

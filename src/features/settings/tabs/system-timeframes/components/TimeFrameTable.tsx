// Feature: settings-timeframe
import { Table } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { DeleteOutlined, EditOutlined, MoreOutlined } from "@ant-design/icons";
import { Button, Dropdown, Flex, Switch, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SystemTimeFrame } from "../types/system-timeframe";
import { getLateWindowBadge } from "../utils/displayHelpers";
import { resolveScopeReferenceLabel } from "../utils/resolveScopeReferenceLabel";

type TimeFrameTableProps = {
  timeFrames: SystemTimeFrame[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (record: SystemTimeFrame) => void;
  onDelete: (record: SystemTimeFrame) => void;
  onToggleActive: (record: SystemTimeFrame) => void;
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SCOPE_LABELS: Record<string, string> = {
  GLOBAL: "Global",
  FACULTY: "Faculty",
  DEPARTMENT: "Department",
  PROGRAM: "Program",
  LEVEL: "Level",
  STUDENT: "Student",
};

const SEMESTER_STATUS_COLORS: Record<string, string> = {
  OPEN: "green",
  PENDING: "default",
  GRADING: "gold",
  CLOSED: "red",
};

export function TimeFrameTable({
  timeFrames,
  isLoading,
  isError,
  onEdit,
  onDelete,
  onToggleActive,
}: TimeFrameTableProps) {
  const token = useToken();

  const columns: ColumnsType<SystemTimeFrame> = [
    {
      title: "Scope",
      dataIndex: "scope",
      key: "scope",
      render: (scope: string) => (
        <Typography.Text style={{ whiteSpace: "nowrap" }}>{SCOPE_LABELS[scope] ?? scope}</Typography.Text>
      ),
    },
    {
      title: "Reference",
      key: "reference",
      render: (_: unknown, record: SystemTimeFrame) => (
        <Typography.Text type={record.isActive ? undefined : "secondary"}>
          {resolveScopeReferenceLabel(record.scope, record.referenceId, record.scopeReference)}
        </Typography.Text>
      ),
    },
    {
      title: "Session",
      key: "session",
      render: (_: unknown, record: SystemTimeFrame) => {
        if (record.sessionId === null) return <Typography.Text type="secondary">—</Typography.Text>;
        const name = record.session?.name ?? `Session #${record.sessionId}`;
        return (
          <Typography.Text type={record.isActive ? undefined : "secondary"}>
            {name}
            {record.session?.isCurrent && (
              <Tag color="blue" style={{ marginLeft: 6, fontSize: 11 }}>Current</Tag>
            )}
          </Typography.Text>
        );
      },
    },
    {
      title: "Semester",
      key: "semester",
      render: (_: unknown, record: SystemTimeFrame) => {
        if (record.semesterId === null) return <Typography.Text type="secondary">—</Typography.Text>;
        const sem = record.semester;
        const name = sem?.semesterTypeName ?? `Semester #${record.semesterId}`;
        return (
          <Flex align="center" gap={4} wrap="wrap">
            <Typography.Text type={record.isActive ? undefined : "secondary"}>
              {name}
            </Typography.Text>
            {sem && (
              <Tag color={SEMESTER_STATUS_COLORS[sem.status] ?? "default"} style={{ margin: 0 }}>
                {sem.status}
              </Tag>
            )}
            {sem?.isCurrent && (
              <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>Current</Tag>
            )}
          </Flex>
        );
      },
    },
    {
      title: "Start",
      dataIndex: "startAt",
      key: "startAt",
      render: (startAt: string, record: SystemTimeFrame) => (
        <Typography.Text type={record.isActive ? undefined : "secondary"}>
          {formatDateTime(startAt)}
        </Typography.Text>
      ),
    },
    {
      title: "End",
      dataIndex: "endAt",
      key: "endAt",
      render: (endAt: string, record: SystemTimeFrame) => (
        <Typography.Text type={record.isActive ? undefined : "secondary"}>
          {formatDateTime(endAt)}
        </Typography.Text>
      ),
    },
    {
      title: "Late Window",
      dataIndex: "isLateWindow",
      key: "isLateWindow",
      render: (isLateWindow: boolean) => {
        const badge = getLateWindowBadge(isLateWindow);
        return badge ? <Tag color={badge.color}>{badge.label}</Tag> : null;
      },
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (_: unknown, record: SystemTimeFrame) => (
        <PermissionGuard permission={Permission.SystemTimeFramesUpdate} fallback={
          <Switch checked={record.isActive} disabled size="small" />
        }>
          <Switch
            checked={record.isActive}
            size="small"
            onChange={() => onToggleActive(record)}
          />
        </PermissionGuard>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      width: 60,
      render: (_: unknown, record: SystemTimeFrame) => {
        const menuItems = [
          {
            key: "edit",
            label: (
              <PermissionGuard permission={Permission.SystemTimeFramesUpdate}>
                <span>Edit</span>
              </PermissionGuard>
            ),
            icon: <EditOutlined />,
            onClick: () => onEdit(record),
          },
          {
            key: "delete",
            label: (
              <PermissionGuard permission={Permission.SystemTimeFramesDelete}>
                <span style={{ color: token.colorError }}>Delete</span>
              </PermissionGuard>
            ),
            icon: <DeleteOutlined style={{ color: token.colorError }} />,
            onClick: () => onDelete(record),
            danger: true as const,
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined style={{ fontSize: 16 }} />}
              style={{ color: token.colorTextTertiary }}
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <DataLoader loading={isLoading}>
      {isError ? (
        <ErrorAlert variant="section" error="Failed to load time frames" />
      ) : (
        <Table<SystemTimeFrame>
          rowKey="id"
          dataSource={timeFrames}
          columns={columns}
          size="md"
          density="comfortable"
          scroll={{ x: true }}
          pagination={false}
          rowClassName={(record) =>
            record.isActive ? "" : "ant-table-row-muted"
          }
          onRow={(record) => ({
            style: record.isActive
              ? undefined
              : { opacity: 0.5, color: token.colorTextSecondary },
          })}
        />
      )}
    </DataLoader>
  );
}

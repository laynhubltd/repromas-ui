import { useToken } from "@/shared/hooks/useToken";
import type {
  Semester,
  SemesterStatus,
  SessionWithSemesters,
} from "@/shared/types/settings-types";
import {
  DownOutlined,
  MoreOutlined,
  PlusCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button, Collapse, Dropdown, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function statusTag(status: SemesterStatus) {
  const map: Record<
    SemesterStatus,
    { color: "success" | "default" | "warning"; label: string }
  > = {
    OPEN: { color: "success", label: "OPEN" },
    CLOSED: { color: "default", label: "CLOSED" },
    GRADING: { color: "warning", label: "GRADING" },
  };
  const { color, label } = map[status];
  return <Tag color={color}>{label}</Tag>;
}

export interface SessionCollapseProps {
  item: SessionWithSemesters;
  defaultExpanded?: boolean;
  onAddSemester?: (session: { id: number; name: string }) => void;
  onEditSemester?: (semester: Semester) => void;
  onSessionMenu?: (sessionId: number) => MenuProps["items"];
}

export function SessionCollapse({
  item,
  defaultExpanded = false,
  onAddSemester,
  onEditSemester,
  onSessionMenu,
}: SessionCollapseProps) {
  const token = useToken();
  const { session, semesters } = item;

  const columns: ColumnsType<Semester> = [
    { title: "Semester name", dataIndex: "name", key: "name" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: SemesterStatus) => statusTag(status),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => onEditSemester?.(record)}>
          Edit
        </Button>
      ),
    },
  ];

  const header = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <Space size={token.sizeLG} align="start">
        <div>
          <Typography.Text strong>{session.name}</Typography.Text>
          <div style={{ marginTop: 4, display: "flex", gap: token.sizeLG }}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Start: {formatDate(session.startDate)}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              End: {formatDate(session.endDate)}
            </Typography.Text>
          </div>
        </div>
        {session.isCurrent ? <Tag color="success">Current</Tag> : null}
      </Space>
      <Space size={token.sizeMD}>
        <Tag>{semesters.length} Semesters</Tag>
        {onSessionMenu?.(session.id)?.length ? (
          <Dropdown menu={{ items: onSessionMenu(session.id) }} trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        ) : null}
      </Space>
    </div>
  );

  return (
    <Collapse
      expandIconPosition="start"
      expandIcon={({ isActive }) =>
        isActive ? <DownOutlined /> : <RightOutlined />
      }
      defaultActiveKey={defaultExpanded ? [session.id] : undefined}
      items={[
        {
          key: session.id,
          label: header,
          children: (
            <div>
              <Table
                size="small"
                dataSource={semesters}
                columns={columns}
                rowKey="id"
                pagination={false}
              />
              {onAddSemester ? (
                <div style={{ padding: token.paddingSM, display: "flex", justifyContent: "center" }}>
                  <Button
                    type="link"
                    size="small"
                    icon={<PlusCircleOutlined />}
                    onClick={() => onAddSemester({ id: session.id, name: session.name })}
                  >
                    Add Semester
                  </Button>
                </div>
              ) : null}
            </div>
          ),
        },
      ]}
    />
  );
}

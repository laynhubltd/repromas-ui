import { useToken } from "@/hooks/useToken";
import type { SessionWithSemesters } from "../../types";
import { DownOutlined, MoreOutlined, PlusCircleOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Collapse, Dropdown, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import type { Semester, SemesterStatus } from "../../types";

function formatDate(value: string): string {
  try {
    const d = new Date(value);
    return d.toLocaleDateString("en-GB", {
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
    {
      title: "Semester name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <Typography.Text style={{ color: token.colorText }}>
          {name}
        </Typography.Text>
      ),
    },
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
        <Button
          type="link"
          size="small"
          style={{ padding: 0, fontWeight: 600 }}
          onClick={() => onEditSemester?.(record)}
        >
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
        paddingRight: token.sizeMD,
      }}
    >
      <Space size={token.sizeLG} align="start">
        <div>
          <Typography.Text strong style={{ color: token.colorText }}>
            {session.name}
          </Typography.Text>
          <div style={{ marginTop: 4, display: "flex", gap: token.sizeLG }}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              <span style={{ fontWeight: 500 }}>Start date:</span>{" "}
              {formatDate(session.startDate)}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              <span style={{ fontWeight: 500 }}>End date:</span>{" "}
              {formatDate(session.endDate)}
            </Typography.Text>
          </div>
        </div>
        {session.isCurrent && (
          <Tag
            color="success"
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Current
          </Tag>
        )}
      </Space>
      <Space size={token.sizeMD}>
        <Tag style={{ fontSize: 12, color: token.colorTextSecondary }}>
          {semesters.length} Semesters
        </Tag>
        {onSessionMenu?.(session.id)?.length ? (
          <Dropdown
            menu={{ items: onSessionMenu(session.id) }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              style={{ color: token.colorPrimary }}
            />
          </Dropdown>
        ) : null}
      </Space>
    </div>
  );

  return (
    <Collapse
      style={{
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadius,
        overflow: "hidden",
        marginBottom: token.marginSM,
      }}
      className="session-collapse"
      expandIconPosition="start"
      expandIcon={({ isActive }) => (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#fff",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          }}
        >
          {isActive ? (
            <DownOutlined style={{ fontSize: 14, color: token.colorText }} />
          ) : (
            <RightOutlined style={{ fontSize: 14, color: token.colorText }} />
          )}
        </span>
      )}
      defaultActiveKey={defaultExpanded ? [session.id] : undefined}
      items={[
        {
          key: session.id,
          label: header,
          children: (
            <div style={{ borderTop: `1px solid ${token.colorBorderSecondary}` }}>
              <Table
                size="small"
                dataSource={semesters}
                columns={columns}
                rowKey="id"
                pagination={false}
                style={{ background: token.colorBgContainer }}
                locale={{ emptyText: "No semesters for this session" }}
              />
              {onAddSemester && (
                <div
                  style={{
                    padding: token.paddingSM,
                    background: token.colorBgLayout,
                    borderTop: `1px solid ${token.colorBorderSecondary}`,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    type="link"
                    size="small"
                    icon={<PlusCircleOutlined />}
                    onClick={() => onAddSemester?.({ id: session.id, name: session.name })}
                    style={{ fontWeight: 500 }}
                  >
                    Add Semester
                  </Button>
                </div>
              )}
            </div>
          ),
        },
      ]}
    />
  );
}

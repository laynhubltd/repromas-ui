import { colors, hexToRgba } from "@/config/theme";
import { useToken } from "@/hooks/useToken";
import type { Level } from "../types";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Empty, Table, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { AddLevelModal } from "./AddLevelModal";
import { LevelsContextCards } from "./LevelsContextCards";
import { LevelsHeroBanner } from "./LevelsHeroBanner";

export interface LevelConfigTabProps {
  levels?: Level[];
  loading?: boolean;
  onAdd?: (values: {
    name: string;
    rankOrder: number;
    description?: string | null;
  }) => void | Promise<void>;
  onEdit?: (item: Level) => void;
  onDelete?: (item: Level) => void;
}

export function LevelConfigTab({
  levels = [],
  loading = false,
  onAdd,
  onEdit,
  onDelete,
}: LevelConfigTabProps) {
  const token = useToken();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleAdd = async (values: {
    name: string;
    rankOrder: number;
    description?: string | null;
  }) => {
    if (!onAdd) return;
    setSubmitLoading(true);
    try {
      await onAdd(values);
      setModalOpen(false);
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns: ColumnsType<Level> = [
    {
      title: "Level Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            background: token.colorBgLayout,
            color: token.colorTextSecondary,
            fontSize: 10,
            fontWeight: 600,
            borderRadius: token.borderRadius,
          }}
        >
          {name}
        </span>
      ),
    },
    {
      title: "Rank Order",
      dataIndex: "rankOrder",
      key: "rankOrder",
      width: 100,
      render: (rankOrder: number) => (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: token.borderRadius,
            background: hexToRgba(colors.primary, 0.05),
            color: colors.primary,
            fontWeight: 700,
            fontSize: token.fontSizeSM,
          }}
        >
          {rankOrder}
        </span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (description: string | null) => (
        <Typography.Text
          type="secondary"
          style={{
            fontSize: token.fontSizeSM,
            maxWidth: 280,
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontStyle: description ? "normal" : "italic",
          }}
        >
          {description ?? "—"}
        </Typography.Text>
      ),
    },
    ...(onEdit || onDelete
      ? [
          {
            title: "Actions",
            key: "actions",
            align: "right" as const,
            width: 100,
            render: (_: unknown, record: Level) => (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                {onEdit && (
                  <Tooltip title="Edit">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined style={{ fontSize: 18 }} />}
                      onClick={() => onEdit(record)}
                      style={{
                        width: 32,
                        height: 32,
                        minWidth: 32,
                        color: colors.primary,
                      }}
                    />
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip title="Delete">
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined style={{ fontSize: 18 }} />}
                      onClick={() => onDelete(record)}
                      style={{
                        width: 32,
                        height: 32,
                        minWidth: 32,
                        color: token.colorError,
                      }}
                    />
                  </Tooltip>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: token.sizeLG,
        width: "100%",
      }}
    >
      <LevelsHeroBanner />

      <div
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius,
          border: `1px solid ${token.colorBorder}`,
          overflow: "hidden",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            padding: "16px 24px",
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: token.sizeMD,
            background: token.colorBgContainer,
          }}
        >
          <div>
            <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>
              Level Management
            </Typography.Title>
            <Typography.Text
              type="secondary"
              style={{
                fontSize: 12,
                display: "block",
                marginTop: 2,
                color: token.colorTextSecondary,
              }}
            >
              Configure student progression tiers
            </Typography.Text>
          </div>
          {onAdd && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalOpen(true)}
              style={{ fontWeight: 600, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
            >
              Add New Level
            </Button>
          )}
        </div>

        <Table
          dataSource={levels}
          columns={columns.map((col) => ({
            ...col,
            title:
              typeof col.title === "string" ? (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: token.colorTextSecondary,
                  }}
                >
                  {col.title}
                </span>
              ) : (
                col.title
              ),
          }))}
          rowKey="id"
          loading={loading}
          pagination={{
            position: ["bottomRight"],
            showTotal: (total) => (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: token.colorTextSecondary,
                }}
              >
                Showing {total} of {total} level{total !== 1 ? "s" : ""}
              </span>
            ),
            size: "small",
            showSizeChanger: false,
          }}
          locale={{
            emptyText: (
              <Empty
                description="No levels. Add one to define academic progression."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
          style={{ marginBottom: 0 }}
          styles={{
            header: { background: token.colorBgLayout },
            body: {
              cell: { padding: "16px 24px" },
            },
          }}
        />
      </div>

      <LevelsContextCards />

      {onAdd && (
        <AddLevelModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleAdd}
          loading={submitLoading}
        />
      )}
    </div>
  );
}

import { useThemeColors } from "@/app/theme/useThemeColors";
import { hexToRgba } from "@/app/theme/themeConfig";
import { useToken } from "@/shared/hooks/useToken";
import type { Level } from "@/shared/types/settings-types";
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
  const colors = useThemeColors();

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
        <Typography.Text type="secondary">
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 4,
                }}
              >
                {onEdit ? (
                  <Tooltip title="Edit">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined style={{ fontSize: 18 }} />}
                      onClick={() => onEdit(record)}
                    />
                  </Tooltip>
                ) : null}
                {onDelete ? (
                  <Tooltip title="Delete">
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined style={{ fontSize: 18 }} />}
                      onClick={() => onDelete(record)}
                    />
                  </Tooltip>
                ) : null}
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
      <LevelsContextCards />

      <div
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius,
          border: `1px solid ${token.colorBorder}`,
          overflow: "hidden",
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
          }}
        >
          <div>
            <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>
              Level Management
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Configure student progression tiers
            </Typography.Text>
          </div>
          {onAdd ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalOpen(true)}
            >
              Add Level
            </Button>
          ) : null}
        </div>

        <div style={{ padding: 24 }}>
          {levels.length === 0 && !loading ? (
            <Empty description="No levels configured" />
          ) : (
            <Table
              rowKey="id"
              dataSource={levels}
              loading={loading}
              columns={columns}
              pagination={false}
            />
          )}
        </div>
      </div>

      <AddLevelModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAdd}
        loading={submitLoading}
      />
    </div>
  );
}

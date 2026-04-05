import { hexToRgba } from "@/app/theme/themeConfig";
import { useThemeColors } from "@/app/theme/useThemeColors";
import { Table } from "@/components/ui-kit";
import { useToken } from "@/shared/hooks/useToken";
import type { Level } from "@/shared/types/settings-types";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Tooltip, Typography } from "antd";
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
  const colors = useThemeColors();
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
        <Typography.Text type="secondary">{description ?? "—"}</Typography.Text>
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
              <Flex align="center" justify="flex-end" gap={4}>
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
              </Flex>
            ),
          },
        ]
      : []),
  ];

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <LevelsHeroBanner />
      <LevelsContextCards />
      <Table
        header={{
          title: "Level Management",
          subtitle: "Configure student progression tiers",
          extra: onAdd ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalOpen(true)}
            >
              Add Level
            </Button>
          ) : undefined,
        }}
        rowKey="id"
        dataSource={levels}
        columns={columns}
        pagination={false}
        size="md"
        density="comfortable"
        state={loading ? "loading" : "default"}
        emptyState={
          levels.length === 0 && !loading
            ? {
                title: "No levels configured",
                description: "Add a level to get started.",
                action: onAdd ? (
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => setModalOpen(true)}
                  >
                    Add Level
                  </Button>
                ) : undefined,
              }
            : undefined
        }
      />
      <AddLevelModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAdd}
        loading={submitLoading}
      />
    </Flex>
  );
}

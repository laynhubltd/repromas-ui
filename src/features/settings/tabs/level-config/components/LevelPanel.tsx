// Feature: level-config
import { DashCard, Table } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer, centeredBox } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Input, Row, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import type { Level } from "../types/level";

export type LevelPanelProps = {
  levels: Level[];
  totalItems: number;
  isLoading: boolean;
  isError: boolean;
  page: number;
  itemsPerPage: number;
  search: string;
  onSearchChange: (value: string) => void;
  onSortChange: (sort: string) => void;
  onPageChange: (page: number, size: number) => void;
  onOpenCreate: () => void;
  onOpenEdit: (level: Level) => void;
  onOpenDelete: (level: Level) => void;
  refetchLevels: () => void;
  hasData: boolean;
  isSearchActive: boolean;
  hasLevelCategory: boolean;
  selectedCategoryId: number | null;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function LevelPanel({
  levels,
  totalItems,
  isLoading,
  isError,
  page,
  itemsPerPage,
  search,
  onSearchChange,
  onSortChange,
  onPageChange,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
  refetchLevels,
  hasData,
  isSearchActive,
  hasLevelCategory,
  selectedCategoryId,
}: LevelPanelProps) {
  const token = useToken();

  const highestRank =
    levels.length > 0 ? Math.max(...levels.map((l) => l.rankOrder)) : "—";

  const cardState = isLoading ? "loading" : "default";

  const handleTableChange = (
    _: unknown,
    __: unknown,
    sorter: SorterResult<Level> | SorterResult<Level>[],
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (!s.columnKey || !s.order) {
      onSortChange("rankOrder:asc");
      return;
    }
    onSortChange(`${String(s.columnKey)}:${s.order === "ascend" ? "asc" : "desc"}`);
  };

  const columns: ColumnsType<Level> = [
    {
      title: "Rank",
      dataIndex: "rankOrder",
      key: "rankOrder",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      width: 80,
      render: (rankOrder: number) => (
        <Tag
          style={{
            fontWeight: 700,
            fontSize: token.fontSizeSM,
            borderRadius: token.borderRadius,
            minWidth: 32,
            textAlign: "center",
          }}
        >
          {rankOrder}
        </Tag>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description: string | null) => (
        <Typography.Text type="secondary">{description ?? "—"}</Typography.Text>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (createdAt: string) => formatDate(createdAt),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      width: 100,
      render: (_: unknown, record: Level) => (
        <Flex align="center" justify="flex-end" gap={4}>
          <PermissionGuard permission={Permission.LevelsUpdate}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ fontSize: 16 }} />}
              onClick={() => onOpenEdit(record)}
              title="Edit"
            />
          </PermissionGuard>
          <PermissionGuard permission={Permission.LevelsDelete}>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined style={{ fontSize: 16 }} />}
              onClick={() => onOpenDelete(record)}
              title="Delete"
            />
          </PermissionGuard>
        </Flex>
      ),
    },
  ];

  // Disable create if categories are enabled but none is selected
  const isCreateDisabled = hasLevelCategory && selectedCategoryId === null;

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <Typography.Text strong style={{ fontSize: token.fontSize, color: token.colorText }}>
          Levels
        </Typography.Text>
      </div>

      {/* Metrics row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <DashCard
            title="Total Levels"
            value={totalItems}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12}>
          <DashCard
            title="Highest Rank"
            value={highestRank}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      {/* Search + Create button row */}
      <Flex gap={12} align="center" wrap="wrap">
        <Input
          placeholder="Search by name…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
          style={{ maxWidth: 320 }}
          disabled={hasLevelCategory && selectedCategoryId === null}
        />
        <PermissionGuard permission={Permission.LevelsCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onOpenCreate}
            style={{ fontWeight: 600 }}
            disabled={isCreateDisabled}
            title={isCreateDisabled ? "Select a category first to create a level" : undefined}
          >
            Create Level
          </Button>
        </PermissionGuard>
      </Flex>

      {/* Table area */}
      <DataLoader loading={isLoading} loader={<SkeletonRows count={5} variant="card" />}>
        {/* Error state */}
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error="Failed to load levels"
            onRetry={refetchLevels}
          />
        </ConditionalRenderer>

        {/* Empty state — Please select a category */}
        <ConditionalRenderer
          when={hasLevelCategory && selectedCategoryId === null}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
            padding: 32,
          })}
        >
          <Typography.Text type="secondary" style={{ display: "block" }}>
            Select a Level Category from the left panel to view its levels.
          </Typography.Text>
        </ConditionalRenderer>

        {/* Empty state — no search active */}
        <ConditionalRenderer
          when={!isError && !hasData && !isSearchActive && (!hasLevelCategory || selectedCategoryId !== null)}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            No levels configured in this category. Create your first level to get started.
          </Typography.Text>
          <PermissionGuard permission={Permission.LevelsCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onOpenCreate}
              style={{ fontWeight: 600 }}
              disabled={isCreateDisabled}
            >
              Create Level
            </Button>
          </PermissionGuard>
        </ConditionalRenderer>

        {/* Empty state — search active but no results */}
        <ConditionalRenderer
          when={!isError && !hasData && isSearchActive}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
            No levels found matching your search.
          </Typography.Text>
          <Button type="link" onClick={() => onSearchChange("")}>
            Clear search
          </Button>
        </ConditionalRenderer>

        {/* Table */}
        <ConditionalRenderer when={!isError && hasData}>
          <Table<Level>
            rowKey="id"
            dataSource={levels}
            columns={columns}
            size="md"
            density="comfortable"
            scroll={{ x: true }}
            onChange={handleTableChange}
            pagination={{
              current: page,
              pageSize: itemsPerPage,
              total: totalItems,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
          />
        </ConditionalRenderer>
      </DataLoader>
    </Flex>
  );
}

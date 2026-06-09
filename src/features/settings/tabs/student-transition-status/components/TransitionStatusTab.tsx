// Feature: student-transition-status
import { DashCard, ExplainerCallout, Table } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  IS_DEFAULT_FILTER_OPTIONS,
  STATE_CATEGORY_OPTIONS,
  TRANSITION_STATUS_NO_DEFAULT_BANNER,
} from "@/shared/constants/studentTransitionStatusOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer, centeredBox } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Col,
  Flex,
  Form,
  Input,
  Popover,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import { useState } from "react";
import { useTransitionStatusTab } from "../hooks/useTransitionStatusTab";
import type { StateCategory, StudentTransitionStatus } from "../types/student-transition-status";
import { getStateCategoryColor } from "../utils/stateCategoryColor";
import { isSortFieldAllowed } from "../utils/sortFieldAllowlist";
import { DeleteTransitionStatusModal } from "./modals/DeleteTransitionStatusModal";
import { TransitionStatusFormModal } from "./modals/TransitionStatusFormModal";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function TransitionStatusTab() {
  const token = useToken();
  const { state, actions, flags } = useTransitionStatusTab();
  const {
    statuses,
    totalItems,
    isLoading,
    isError,
    page,
    itemsPerPage,
    search,
    categoryFilter,
    isDefaultFilter,
    sort,
    formTarget,
    deleteTarget,
    formModalOpen,
    deleteModalOpen,
    usageCount,
  } = state;
  const {
    handleSearchChange,
    handleCategoryFilterChange,
    handleIsDefaultFilterChange,
    handleClearFilters,
    handleSortChange,
    handlePageChange,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    handleCloseForm,
    handleCloseDelete,
    refetch,
  } = actions;
  const { hasData, isSearchActive, activeFilterCount, hasDefaultConfigured } =
    flags;

  const [filterOpen, setFilterOpen] = useState(false);

  const cardState = isLoading ? "loading" : "default";

  const categoryBreakdown = statuses.reduce<Record<string, number>>(
    (acc: Record<string, number>, s: StudentTransitionStatus) => {
      acc[s.stateCategory] = (acc[s.stateCategory] ?? 0) + 1;
      return acc;
    },
    {},
  );
  const breakdownLabel =
    statuses.length > 0
      ? `P: ${categoryBreakdown.POSITIVE ?? 0} · N: ${categoryBreakdown.NEGATIVE ?? 0} · Neutral: ${categoryBreakdown.NEUTRAL ?? 0}`
      : "—";

  const handleTableChange = (
    _: unknown,
    __: unknown,
    sorter: SorterResult<StudentTransitionStatus> | SorterResult<StudentTransitionStatus>[],
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (!s.columnKey || !s.order) {
      handleSortChange("name:asc");
      return;
    }
    const field = String(s.columnKey);
    if (isSortFieldAllowed(field)) {
      handleSortChange(`${field}:${s.order === "ascend" ? "asc" : "desc"}`);
    }
  };

  const [sortField, sortOrder] = sort.split(":");
  const antSortOrder = (sortOrder === "asc" ? "ascend" : "descend") as
    | "ascend"
    | "descend";

  const columns: ColumnsType<StudentTransitionStatus> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: isSortFieldAllowed("name"),
      sortDirections: ["ascend", "descend"],
      sortOrder: sortField === "name" ? antSortOrder : undefined,
      render: (name: string, record: StudentTransitionStatus) => (
        <Flex align="center" gap={8} wrap="wrap">
          <Typography.Text strong>{name}</Typography.Text>
          <ConditionalRenderer when={record.isDefault}>
            <Tag color="green" style={{ margin: 0 }}>
              Default
            </Tag>
          </ConditionalRenderer>
        </Flex>
      ),
    },
    {
      title: "Category",
      dataIndex: "stateCategory",
      key: "stateCategory",
      sorter: isSortFieldAllowed("stateCategory"),
      sortDirections: ["ascend", "descend"],
      sortOrder: sortField === "stateCategory" ? antSortOrder : undefined,
      render: (category: StateCategory) => {
        const color = getStateCategoryColor(category, token);
        return (
          <Tag
            style={{
              color,
              borderColor: color,
              background: "transparent",
              fontWeight: 600,
              fontSize: token.fontSizeSM,
            }}
          >
            {category}
          </Tag>
        );
      },
    },
    {
      title: "Can Register",
      dataIndex: "canRegisterCourses",
      key: "canRegisterCourses",
      sorter: false,
      align: "center",
      render: (val: boolean) =>
        val ? (
          <CheckCircleOutlined style={{ color: token.colorSuccess, fontSize: 16 }} />
        ) : (
          <CloseCircleOutlined style={{ color: token.colorTextTertiary, fontSize: 16 }} />
        ),
    },
    {
      title: "Terminal",
      dataIndex: "isTerminal",
      key: "isTerminal",
      sorter: false,
      align: "center",
      render: (val: boolean) =>
        val ? (
          <CheckCircleOutlined style={{ color: token.colorError, fontSize: 16 }} />
        ) : (
          <CloseCircleOutlined style={{ color: token.colorTextTertiary, fontSize: 16 }} />
        ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: isSortFieldAllowed("createdAt"),
      sortDirections: ["ascend", "descend"],
      sortOrder: sortField === "createdAt" ? antSortOrder : undefined,
      render: (createdAt: string) => formatDate(createdAt),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      width: 100,
      render: (_: unknown, record: StudentTransitionStatus) => (
        <Flex align="center" justify="flex-end" gap={4}>
          <PermissionGuard permission={Permission.StudentTransitionStatusesUpdate}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ fontSize: 16 }} />}
              onClick={() => handleOpenEdit(record)}
              title="Edit"
            />
          </PermissionGuard>
          <PermissionGuard permission={Permission.StudentTransitionStatusesDelete}>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined style={{ fontSize: 16 }} />}
              onClick={() => handleOpenDelete(record)}
              title="Delete"
            />
          </PermissionGuard>
        </Flex>
      ),
    },
  ];

  const filterPopoverContent = (
    <Flex vertical gap={16} style={{ width: 260 }}>
      <Form layout="vertical" size="middle">
        <Form.Item label="State Category" style={{ marginBottom: 12 }}>
          <Select
            placeholder="All Categories"
            allowClear
            value={categoryFilter}
            onChange={(val: StateCategory | undefined) => {
              handleCategoryFilterChange(val);
            }}
            style={{ width: "100%" }}
            options={STATE_CATEGORY_OPTIONS}
          />
        </Form.Item>
        <Form.Item label="Default Status" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any"
            value={
              isDefaultFilter === undefined ? "any" : String(isDefaultFilter)
            }
            onChange={(val: string) => {
              handleIsDefaultFilterChange(
                val === "any" ? undefined : val === "true",
              );
            }}
            style={{ width: "100%" }}
            options={IS_DEFAULT_FILTER_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
          />
        </Form.Item>
      </Form>
      <ConditionalRenderer when={activeFilterCount > 0}>
        <Button
          type="link"
          size="small"
          onClick={() => {
            handleClearFilters();
            setFilterOpen(false);
          }}
          style={{ padding: 0 }}
        >
          Clear all filters
        </Button>
      </ConditionalRenderer>
    </Flex>
  );

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <ExplainerCallout
        intent="info"
        title="Student Transition Statuses"
        body="Define the academic states that students can be assigned to. Each status controls what students are permitted to do — including course registration, portal access, broadsheet appearance, and residency counting. Exactly one status must be marked as default for new student enrollment."
        dismissible
        collapsible
      />

      <ConditionalRenderer when={!isLoading && !hasDefaultConfigured}>
        <ErrorAlert
          variant="section"
          error={TRANSITION_STATUS_NO_DEFAULT_BANNER}
          action={
            <PermissionGuard permission={Permission.StudentTransitionStatusesCreate}>
              <Button type="primary" size="small" onClick={handleOpenCreate}>
                Create default status
              </Button>
            </PermissionGuard>
          }
        />
      </ConditionalRenderer>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <DashCard
            title="Total Statuses"
            value={totalItems}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={8}>
          <DashCard
            title="Default Configured"
            value={hasDefaultConfigured ? "Yes" : "No"}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={8}>
          <DashCard
            title="Category Breakdown"
            value={breakdownLabel}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Flex gap={12} align="center" wrap="wrap" flex={1}>
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            allowClear
            style={{ maxWidth: 320 }}
          />
          <Popover
            content={filterPopoverContent}
            title={
              <Flex justify="space-between" align="center">
                <Space>
                  <FilterOutlined />
                  <span>Filters</span>
                </Space>
              </Flex>
            }
            trigger="click"
            open={filterOpen}
            onOpenChange={setFilterOpen}
            placement="bottomLeft"
            arrow={false}
          >
            <Badge count={activeFilterCount} size="small">
              <Button
                icon={<FilterOutlined />}
                type={activeFilterCount > 0 ? "primary" : "default"}
              >
                Filters
              </Button>
            </Badge>
          </Popover>
        </Flex>
        <PermissionGuard permission={Permission.StudentTransitionStatusesCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{ fontWeight: 600 }}
          >
            Create Status
          </Button>
        </PermissionGuard>
      </Flex>

      <DataLoader loading={isLoading} loader={<SkeletonRows count={5} variant="card" />}>
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error="Failed to load transition statuses"
            onRetry={refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!isError && !hasData && !isSearchActive}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            No transition statuses configured. Create your first status and mark it as default.
          </Typography.Text>
          <PermissionGuard permission={Permission.StudentTransitionStatusesCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              style={{ fontWeight: 600 }}
            >
              Create Status
            </Button>
          </PermissionGuard>
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!isError && !hasData && isSearchActive}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
            No transition statuses found matching your search.
          </Typography.Text>
          <Button type="link" onClick={() => handleSearchChange("")}>
            Clear search
          </Button>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && hasData}>
          <Table<StudentTransitionStatus>
            rowKey="id"
            dataSource={statuses}
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
              onChange: handlePageChange,
              onShowSizeChange: handlePageChange,
            }}
          />
        </ConditionalRenderer>
      </DataLoader>

      <TransitionStatusFormModal
        open={formModalOpen}
        target={formTarget}
        isInUse={usageCount > 0}
        hasNoDefaultInTenant={!hasDefaultConfigured}
        onClose={handleCloseForm}
      />
      <DeleteTransitionStatusModal
        open={deleteModalOpen}
        target={deleteTarget}
        usageCount={usageCount}
        onClose={handleCloseDelete}
      />
    </Flex>
  );
}

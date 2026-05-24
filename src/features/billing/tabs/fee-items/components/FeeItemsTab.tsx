import { DashCard, ExplainerCallout, Table } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  FEE_ITEM_ITEMS_PER_PAGE,
  FEE_ITEM_UI_COPY,
} from "@/shared/constants/feeItemOptions";
import { useToken } from "@/shared/hooks/useToken";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Col,
  Flex,
  Input,
  Row,
  Select,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import { useFeeItemsTab } from "../hooks/useFeeItemsTab";
import type { FeeItem } from "../types/fee-item";
import {
  formatAccountingCode,
  formatFeeItemCreatedAt,
  getFeeItemStatusLabel,
} from "../utils/feeItemDisplay";
import { DeleteFeeItemModal } from "./modals/DeleteFeeItemModal";
import { FeeItemFormModal } from "./modals/FeeItemFormModal";

export function FeeItemsTab() {
  const token = useToken();
  const { state, actions, flags } = useFeeItemsTab();
  const {
    feeItems,
    totalItems,
    activeCount,
    isLoading,
    isError,
    sectionError,
    search,
    page,
    isActiveFilter,
    formTarget,
    formOpen,
    deleteTarget,
    deleteOpen,
    activeFilterOptions,
  } = state;
  const {
    handleSearchChange,
    handlePageChange,
    handleIsActiveFilterChange,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleOpenDelete,
    handleCloseDelete,
    refetch,
  } = actions;
  const { hasData, isSearchActive } = flags;

  const cardState = isLoading ? "loading" : "default";

  const columns = useMemo<ColumnsType<FeeItem>>(
    () => [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        ellipsis: true,
        render: (name: string) => (
          <Typography.Text strong ellipsis={{ tooltip: name }}>
            {name}
          </Typography.Text>
        ),
      },
      {
        title: "Accounting code",
        dataIndex: "accountingCode",
        key: "accountingCode",
        width: 160,
        ellipsis: true,
        render: (code: string | null) => (
          <Typography.Text style={{ fontSize: token.fontSizeSM }}>
            {formatAccountingCode(code)}
          </Typography.Text>
        ),
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        ellipsis: true,
        render: (description: string | null) =>
          description ? (
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
              ellipsis={{ tooltip: description }}
            >
              {description}
            </Typography.Text>
          ) : (
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              —
            </Typography.Text>
          ),
      },
      {
        title: "Status",
        dataIndex: "isActive",
        key: "isActive",
        width: 110,
        render: (_: boolean, record: FeeItem) => (
          <Badge
            status={record.isActive ? "success" : "default"}
            text={
              <span style={{ fontSize: token.fontSizeSM }}>
                {getFeeItemStatusLabel(record)}
              </span>
            }
          />
        ),
      },
      {
        title: "Added",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 120,
        render: (createdAt: string) => (
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {formatFeeItemCreatedAt(createdAt)}
          </Typography.Text>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        align: "right",
        width: 100,
        fixed: "right",
        render: (_: unknown, record: FeeItem) => (
          <Flex align="center" justify="flex-end" gap={4}>
            <PermissionGuard permission={Permission.BillingFeeItemsUpdate}>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined style={{ fontSize: 16 }} />}
                onClick={() => handleOpenEdit(record)}
                title="Edit"
              />
            </PermissionGuard>
            <PermissionGuard permission={Permission.BillingFeeItemsDelete}>
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
    ],
    [
      handleOpenDelete,
      handleOpenEdit,
      token.fontSizeSM,
    ],
  );

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <ExplainerCallout
        intent="info"
        collapsible
        title={FEE_ITEM_UI_COPY.explainerTitle}
        body={FEE_ITEM_UI_COPY.explainerBody}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="Total Fee Items"
            value={totalItems}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="Active on Page"
            value={activeCount}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="On This Page"
            value={feeItems.length}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Flex gap={12} align="center" wrap="wrap" style={{ flex: 1 }}>
          <Input
            placeholder="Search by name…"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            allowClear
            style={{ maxWidth: 320, flex: 1, minWidth: 200 }}
          />
          <Select
            placeholder="Any status"
            allowClear
            value={isActiveFilter}
            onChange={handleIsActiveFilterChange}
            style={{ minWidth: 140 }}
            options={activeFilterOptions.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
          />
        </Flex>

        <PermissionGuard permission={Permission.BillingFeeItemsCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{ fontWeight: 600 }}
          >
            Create Fee Item
          </Button>
        </PermissionGuard>
      </Flex>

      <DataLoader
        loading={isLoading}
        loader={<SkeletonRows count={8} variant="inline" />}
      >
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error={sectionError ?? "Failed to load fee items."}
            onRetry={refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!hasData && !isSearchActive && !isError}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Title level={5} style={{ margin: 0, textAlign: "center" }}>
            {FEE_ITEM_UI_COPY.emptyTitle}
          </Typography.Title>
          <Typography.Text
            type="secondary"
            style={{ display: "block", margin: "8px 0 16px", textAlign: "center" }}
          >
            {FEE_ITEM_UI_COPY.emptyBody}
          </Typography.Text>
          <PermissionGuard permission={Permission.BillingFeeItemsCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              style={{ fontWeight: 600 }}
            >
              Create Fee Item
            </Button>
          </PermissionGuard>
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!hasData && isSearchActive && !isError}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary">
            No fee items match your search or filters.
          </Typography.Text>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && hasData}>
          <Table<FeeItem>
            rowKey="id"
            dataSource={feeItems}
            columns={columns}
            size="md"
            density="comfortable"
            scroll={{ x: 900 }}
            pagination={{
              current: page,
              pageSize: FEE_ITEM_ITEMS_PER_PAGE,
              total: totalItems,
              showSizeChanger: false,
              onChange: handlePageChange,
            }}
          />
        </ConditionalRenderer>
      </DataLoader>

      <FeeItemFormModal
        open={formOpen}
        target={formTarget}
        onClose={handleCloseForm}
      />
      <DeleteFeeItemModal
        open={deleteOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
    </Flex>
  );
}

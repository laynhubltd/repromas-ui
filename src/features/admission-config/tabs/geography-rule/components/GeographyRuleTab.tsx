import { Permission } from "@/features/access-control/permissions";
import { PermissionGuard } from "@/features/access-control/PermissionGuard";
import { DashCard, ExplainerCallout } from "@/components/ui-kit";
import { useToken } from "@/shared/hooks/useToken";
import {
  QUOTA_CATEGORY_LABELS,
  QUOTA_CATEGORY_TAG_COLORS,
} from "@/shared/constants/geographyRuleOptions";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
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
  Popover,
  Row,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useGeographyRuleTab } from "../hooks/useGeographyRuleTab";
import type { GeographyRuleRow } from "../hooks/useGeographyRuleTab";
import type { QuotaCategory } from "../types/geography-rule";
import { DeleteGeographyRuleModal } from "./modals/DeleteGeographyRuleModal";
import { GeographyRuleFormModal } from "./modals/GeographyRuleFormModal";

export function GeographyRuleTab() {
  const token = useToken();
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  const { state, actions, flags } = useGeographyRuleTab();
  const {
    rules,
    totalItems,
    isLoading,
    isError,
    catchmentFilter,
    eldsFilter,
    page,
    formTarget,
    formOpen,
    deleteTarget,
    deleteOpen,
    totalRulesCount,
    catchmentCount,
    eldsCount,
    isMetricsRowLoading,
    configuredStateIds,
    states,
  } = state;
  const {
    handleCatchmentFilterChange,
    handleEldsFilterChange,
    handlePageChange,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleOpenDelete,
    handleCloseDelete,
    clearAllFilters,
    refetch,
  } = actions;
  const { hasData, isFilterActive, activeFilterCount } = flags;

  const cardState = isMetricsRowLoading ? "loading" : "default";

  const formatCreatedAt = (createdAt: string): string =>
    new Date(createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const columns: ColumnsType<GeographyRuleRow> = [
    {
      title: "State",
      key: "state",
      width: 200,
      fixed: "left",
      render: (_, record) => (
        <Flex vertical gap={0}>
          <Typography.Text strong>{record.stateName}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {record.stateCode}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: "Category",
      dataIndex: "quotaCategory",
      key: "quotaCategory",
      width: 140,
      render: (category: QuotaCategory) => (
        <Tag color={QUOTA_CATEGORY_TAG_COLORS[category]}>
          {QUOTA_CATEGORY_LABELS[category]}
        </Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (createdAt: string) => formatCreatedAt(createdAt),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record: GeographyRuleRow) => (
        <Flex gap={8}>
          <PermissionGuard permission={Permission.AdmissionGeographyRulesUpdate}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
              title="Edit"
            />
          </PermissionGuard>
          <PermissionGuard permission={Permission.AdmissionGeographyRulesDelete}>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleOpenDelete(record)}
              title="Delete"
            />
          </PermissionGuard>
        </Flex>
      ),
    },
  ];

  const filterPopoverContent = (
    <Flex vertical gap={16} style={{ width: 280 }}>
      <Form layout="vertical" size="middle">
        <Form.Item label="Catchment" style={{ marginBottom: 12 }}>
          <Select
            placeholder="Any"
            allowClear
            value={catchmentFilter}
            onChange={handleCatchmentFilterChange}
            style={{ width: "100%" }}
            options={[
              { value: true, label: "Yes" },
              { value: false, label: "No" },
            ]}
          />
        </Form.Item>
        <Form.Item label="ELDS" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any"
            allowClear
            value={eldsFilter}
            onChange={handleEldsFilterChange}
            style={{ width: "100%" }}
            options={[
              { value: true, label: "Yes" },
              { value: false, label: "No" },
            ]}
          />
        </Form.Item>
        <ConditionalRenderer when={activeFilterCount > 0}>
          <Button
            type="link"
            onClick={() => {
              clearAllFilters();
              setFilterPopoverOpen(false);
            }}
            style={{ padding: 0, marginTop: 8 }}
          >
            Clear all filters
          </Button>
        </ConditionalRenderer>
      </Form>
    </Flex>
  );

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <ExplainerCallout
        intent="info"
        collapsible
        title="Admission Geography Rules"
        body="Map Nigerian states to Catchment or ELDS quota categories. States without a rule automatically compete as Merit at screening time — you only need rules for catchment and ELDS designations. Rules are tenant-wide and apply across admission cycles. You can change a state's category or remove a rule; the state itself cannot be reassigned after creation."
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <DashCard
            title="Total Rules"
            value={totalRulesCount}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={8}>
          <DashCard
            title="Catchment States"
            value={catchmentCount}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={8}>
          <DashCard
            title="ELDS States"
            value={eldsCount}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Popover
          content={filterPopoverContent}
          title={
            <span>
              <FilterOutlined /> Filters
            </span>
          }
          trigger="click"
          arrow={false}
          placement="bottomLeft"
          open={filterPopoverOpen}
          onOpenChange={setFilterPopoverOpen}
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

        <PermissionGuard permission={Permission.AdmissionGeographyRulesCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{ fontWeight: 600 }}
          >
            Create Rule
          </Button>
        </PermissionGuard>
      </Flex>

      <DataLoader loading={isLoading} loader={<SkeletonRows count={5} />}>
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error="Failed to load geography rules."
            onRetry={refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={!hasData && !isFilterActive && !isError}>
          <Flex
            vertical
            gap={16}
            align="center"
            justify="center"
            style={{
              padding: 48,
              border: `1px dashed ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              background: token.colorBgContainer,
            }}
          >
            <Typography.Text type="secondary">
              No geography rules configured yet. Add catchment and ELDS state
              mappings — all other states default to Merit automatically.
            </Typography.Text>
            <PermissionGuard permission={Permission.AdmissionGeographyRulesCreate}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenCreate}
                style={{ fontWeight: 600 }}
              >
                Create Rule
              </Button>
            </PermissionGuard>
          </Flex>
        </ConditionalRenderer>

        <ConditionalRenderer when={!hasData && isFilterActive && !isError}>
          <Flex
            vertical
            gap={8}
            align="center"
            justify="center"
            style={{
              padding: 48,
              border: `1px dashed ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              background: token.colorBgContainer,
            }}
          >
            <Typography.Text type="secondary">
              No rules match the current filters.
            </Typography.Text>
            <Button type="link" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          </Flex>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && hasData}>
          <Table
            columns={columns}
            dataSource={rules}
            rowKey="id"
            scroll={{ x: "max-content" }}
            pagination={{
              current: page,
              pageSize: 30,
              total: totalItems,
              onChange: handlePageChange,
              showSizeChanger: false,
            }}
          />
        </ConditionalRenderer>
      </DataLoader>

      <GeographyRuleFormModal
        open={formOpen}
        target={formTarget}
        onClose={handleCloseForm}
        configuredStateIds={configuredStateIds}
        states={states}
        editRow={
          formTarget
            ? (rules.find((r) => r.id === formTarget.id) ?? null)
            : null
        }
      />
      <DeleteGeographyRuleModal
        open={deleteOpen}
        target={
          deleteTarget
            ? (rules.find((r) => r.id === deleteTarget.id) ?? null)
            : null
        }
        onClose={handleCloseDelete}
      />
    </Flex>
  );
}

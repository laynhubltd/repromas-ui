import { DashCard, ExplainerCallout, Table } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { GATEWAY_CONFIG_UI_COPY } from "@/shared/constants/gatewayConfigOptions";
import { useToken } from "@/shared/hooks/useToken";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  MoreOutlined,
  PlusOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Badge,
  Button,
  Col,
  Dropdown,
  Flex,
  Form,
  Popover,
  Row,
  Select,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import { useMemo, useState } from "react";
import { usePaymentGatewayTab } from "../hooks/usePaymentGatewayTab";
import type { TenantPaymentGatewayConfig } from "../types/payment-gateway-config";
import {
  formatGatewayConfigUpdatedAt,
  formatProviderLabel,
  getGatewayConfigStatusLabel,
  resolveScopeGuidedText,
  resolveScopeShortLabel,
} from "../utils/gatewayConfigDisplay";
import { GatewayCoverageMatrix } from "./GatewayCoverageMatrix";
import { GatewayWebhookHelpPanel } from "./GatewayWebhookHelpPanel";
import { DeletePaymentGatewayConfigModal } from "./modals/DeletePaymentGatewayConfigModal";
import { PaymentGatewayConfigFormModal } from "./modals/PaymentGatewayConfigFormModal";
import { PaymentGatewayConfigDetailDrawer } from "./PaymentGatewayConfigDetailDrawer";

export function PaymentGatewayTab() {
  const token = useToken();
  const [filterOpen, setFilterOpen] = useState(false);

  const { state, actions, flags } = usePaymentGatewayTab();
  const {
    configs,
    allConfigs,
    totalConfigs,
    activeCount,
    coverage,
    eventById,
    isLoading,
    isConfigsError,
    sectionError,
    scopeFilter,
    providerFilter,
    isActiveFilter,
    formTarget,
    formOpen,
    formDefaultGlobalFallback,
    deleteTarget,
    deleteOpen,
    viewConfigId,
    viewOpen,
    activeFilterCount,
    providerFilterOptions,
    scopeFilterOptions,
    activeFilterOptions,
    showNoGlobalFallbackWarning,
    isDeactivating,
    canEdit,
    canDelete,
  } = state;
  const {
    handleScopeFilterChange,
    handleProviderFilterChange,
    handleActiveFilterChange,
    clearAllFilters,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleOpenDelete,
    handleCloseDelete,
    handleOpenView,
    handleCloseView,
    handleEditFromView,
    handleDeactivate,
    refetch,
  } = actions;
  const {
    hasData,
    isFilterActive,
    hasFilteredResults,
    hasActiveGlobalFallback,
    coverageGapCount,
  } = flags;

  const cardState = isLoading ? "loading" : "default";

  const filterContent = (
    <Flex vertical gap={16} style={{ width: 280 }}>
      <Form layout="vertical" size="middle">
        <Form.Item label="Scope" style={{ marginBottom: 12 }}>
          <Select
            placeholder="Any scope"
            allowClear
            value={scopeFilter}
            onChange={handleScopeFilterChange}
            options={scopeFilterOptions.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item label="Provider" style={{ marginBottom: 12 }}>
          <Select
            placeholder="Any provider"
            allowClear
            value={providerFilter}
            onChange={handleProviderFilterChange}
            options={providerFilterOptions}
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item label="Status" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any status"
            allowClear
            value={isActiveFilter}
            onChange={handleActiveFilterChange}
            options={activeFilterOptions.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Form>
      <ConditionalRenderer when={activeFilterCount > 0}>
        <Button
          type="link"
          size="small"
          onClick={() => {
            clearAllFilters();
            setFilterOpen(false);
          }}
          style={{ padding: 0 }}
        >
          Clear all filters
        </Button>
      </ConditionalRenderer>
    </Flex>
  );

  const columns = useMemo<ColumnsType<TenantPaymentGatewayConfig>>(
    () => [
      {
        title: "Scope",
        key: "scope",
        ellipsis: true,
        render: (_: unknown, record) => {
          const label = resolveScopeShortLabel(record, eventById);
          const scopeGuidedText = resolveScopeGuidedText(record, eventById);
          const isGlobal = record.billableEventId == null;
          return (
            <Flex vertical gap={2}>
              <Flex align="center" gap={8}>
                <ConditionalRenderer when={isGlobal}>
                  <Badge
                    count="Global"
                    style={{
                      backgroundColor: token.colorPrimary,
                      fontSize: token.fontSizeSM,
                    }}
                  />
                </ConditionalRenderer>
                <Typography.Text ellipsis={{ tooltip: label }}>
                  {label}
                </Typography.Text>
              </Flex>
              <ConditionalRenderer when={scopeGuidedText != null}>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: token.fontSizeSM }}
                  ellipsis={{ tooltip: scopeGuidedText }}
                >
                  {scopeGuidedText}
                </Typography.Text>
              </ConditionalRenderer>
            </Flex>
          );
        },
      },
      {
        title: "Provider",
        dataIndex: "provider",
        key: "provider",
        width: 140,
        render: (provider: TenantPaymentGatewayConfig["provider"]) => (
          <Typography.Text>{formatProviderLabel(provider)}</Typography.Text>
        ),
      },
      {
        title: "Status",
        dataIndex: "isActive",
        key: "isActive",
        width: 110,
        render: (_: boolean, record) => (
          <Badge
            status={record.isActive ? "success" : "default"}
            text={
              <span style={{ fontSize: token.fontSizeSM }}>
                {getGatewayConfigStatusLabel(record)}
              </span>
            }
          />
        ),
      },
      {
        title: "Updated",
        dataIndex: "updatedAt",
        key: "updatedAt",
        width: 120,
        render: (updatedAt: string) => (
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {formatGatewayConfigUpdatedAt(updatedAt)}
          </Typography.Text>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        align: "right",
        width: 100,
        fixed: "right",
        render: (_: unknown, record) => {
          const menuItems: MenuProps["items"] = [];

          if (canEdit) {
            menuItems.push({
              key: "edit",
              label: "Edit",
              icon: <EditOutlined />,
              onClick: () => handleOpenEdit(record),
            });
          }

          if (canEdit && record.isActive) {
            menuItems.push({
              key: "deactivate",
              label: "Deactivate",
              icon: <StopOutlined />,
              onClick: () => handleDeactivate(record),
            });
          }

          if (canDelete) {
            menuItems.push({
              key: "delete",
              label: "Delete",
              danger: true,
              onClick: () => handleOpenDelete(record),
            });
          }

          return (
            <Flex align="center" justify="flex-end" gap={4}>
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined style={{ fontSize: 16 }} />}
                onClick={() => handleOpenView(record.id)}
                title="View"
              />
              <ConditionalRenderer when={menuItems.length > 0}>
                <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                  <Button
                    type="text"
                    size="small"
                    icon={<MoreOutlined style={{ fontSize: 16 }} />}
                    loading={isDeactivating}
                    title="More actions"
                  />
                </Dropdown>
              </ConditionalRenderer>
            </Flex>
          );
        },
      },
    ],
    [
      canDelete,
      canEdit,
      eventById,
      handleDeactivate,
      handleOpenView,
      handleOpenEdit,
      handleOpenDelete,
      isDeactivating,
      token.colorPrimary,
      token.fontSizeSM,
    ],
  );

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <ExplainerCallout
        intent="info"
        collapsible
        title={GATEWAY_CONFIG_UI_COPY.explainerTitle}
        body={GATEWAY_CONFIG_UI_COPY.explainerBody}
      />

      <ConditionalRenderer when={showNoGlobalFallbackWarning}>
        <Alert
          type="warning"
          showIcon
          message={GATEWAY_CONFIG_UI_COPY.noGlobalFallbackWarning}
          action={
            <Button
              size="small"
              type="primary"
              onClick={() => handleOpenCreate(true)}
            >
              Add global fallback
            </Button>
          }
        />
      </ConditionalRenderer>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <DashCard
            title="Total configs"
            value={totalConfigs}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <DashCard
            title="Active"
            value={activeCount}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <DashCard
            title="Global fallback"
            value={hasActiveGlobalFallback ? "Yes" : "No"}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <DashCard
            title="Coverage gaps"
            value={coverageGapCount}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <ConditionalRenderer when={hasData}>
        <GatewayCoverageMatrix rows={coverage.rows} />
      </ConditionalRenderer>

      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Popover
          content={filterContent}
          title={
            <span>
              <FilterOutlined /> Filters
            </span>
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

        <PermissionGuard permission={Permission.BillingGatewayConfigsCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenCreate(false)}
            style={{ fontWeight: 600 }}
          >
            Add gateway
          </Button>
        </PermissionGuard>
      </Flex>

      <DataLoader
        loading={isLoading}
        loader={<SkeletonRows count={6} variant="inline" />}
      >
        <ConditionalRenderer when={isConfigsError}>
          <ErrorAlert
            variant="section"
            error={sectionError ?? "Failed to load gateway configurations."}
            onRetry={refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!hasData && !isFilterActive && !isConfigsError}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Title level={5} style={{ margin: 0, textAlign: "center" }}>
            {GATEWAY_CONFIG_UI_COPY.emptyTitle}
          </Typography.Title>
          <Typography.Text
            type="secondary"
            style={{ display: "block", margin: "8px 0 16px", textAlign: "center" }}
          >
            {GATEWAY_CONFIG_UI_COPY.emptyBody}
          </Typography.Text>
          <PermissionGuard permission={Permission.BillingGatewayConfigsCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenCreate(true)}
              style={{ fontWeight: 600 }}
            >
              {GATEWAY_CONFIG_UI_COPY.emptyCta}
            </Button>
          </PermissionGuard>
        </ConditionalRenderer>

        <ConditionalRenderer
          when={hasData && !hasFilteredResults && isFilterActive && !isConfigsError}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary">
            No gateway configurations match your filters.
          </Typography.Text>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isConfigsError && hasFilteredResults}>
          <Table<TenantPaymentGatewayConfig>
            rowKey="id"
            dataSource={configs}
            columns={columns}
            size="md"
            density="comfortable"
            scroll={{ x: 720 }}
            pagination={false}
          />
        </ConditionalRenderer>
      </DataLoader>

      <GatewayWebhookHelpPanel />

      <PaymentGatewayConfigDetailDrawer
        configId={viewConfigId}
        open={viewOpen}
        onClose={handleCloseView}
        eventById={eventById}
        onEdit={handleEditFromView}
      />
      <PaymentGatewayConfigFormModal
        open={formOpen}
        target={formTarget}
        onClose={handleCloseForm}
        defaultGlobalFallback={formDefaultGlobalFallback}
        allConfigs={allConfigs}
        eventById={eventById}
      />
      <DeletePaymentGatewayConfigModal
        open={deleteOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
        eventById={eventById}
      />
    </Flex>
  );
}

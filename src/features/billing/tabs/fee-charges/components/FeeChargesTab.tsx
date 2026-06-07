import { DashCard, ExplainerCallout, Table } from "@/components/ui-kit";
import { useGetBillableEventCatalogQuery } from "@/features/billing/tabs/fee-events/api/billableEventApi";
import type { FeeEventsTabLabelMaps } from "@/features/billing/tabs/fee-events/types/fee-events-tab";
import { formatEventCodeLabel } from "@/shared/constants/billingDisplayLabels";
import {
  FEE_CHARGE_ITEMS_PER_PAGE,
  FEE_CHARGE_UI_COPY,
} from "@/shared/constants/feeChargeOptions";
import { useToken } from "@/shared/hooks/useToken";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { EyeOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Flex,
  Pagination,
  Row,
  Select,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import { useFeeChargesTab } from "../hooks/useFeeChargesTab";
import type { FeeCharge } from "../types/fee-charge";
import {
  formatFeeChargeStatus,
  isGrandfatheredFeeCharge,
} from "../utils/feeChargeDisplay";
import { FeeChargeDetailDrawer } from "./FeeChargeDetailDrawer";

type FeeChargesTabProps = {
  initialEventCode?: string | null;
};

export function FeeChargesTab({
  initialEventCode = null,
}: FeeChargesTabProps = {}) {
  const token = useToken();
  const { state, actions, flags } = useFeeChargesTab({ initialEventCode });
  const {
    charges,
    totalItems,
    isLoading,
    isError,
    sectionError,
    page,
    eventCodeFilter,
    statusFilter,
    eventCodeOptions,
    eventByCode,
    detailId,
    detailOpen,
  } = state;
  const {
    handlePageChange,
    handleEventCodeFilterChange,
    handleStatusFilterChange,
    handleOpenDetail,
    handleCloseDetail,
    refetch,
  } = actions;
  const { hasData, isFilterActive } = flags;

  const { data: catalogData } = useGetBillableEventCatalogQuery({
    implementedOnly: true,
  });

  const labelMaps = useMemo((): FeeEventsTabLabelMaps => {
    const triggerLabels: Record<string, string> = {};
    const guardLabels: Record<string, string> = {};
    const timingLabels: Record<string, string> = {};
    const codeLabels: Record<string, string> = {};
    const fulfilledStatusLabels: Record<string, string> = {};
    const occurrenceLabels: Record<string, string> = {};
    const periodLabels: Record<string, string> = {};
    const arrearsLabels: Record<string, string> = {};
    for (const entry of catalogData?.member ?? []) {
      codeLabels[entry.code] = entry.defaultName;
      for (const opt of entry.allowedTriggers) {
        triggerLabels[opt.value] = opt.label;
      }
      for (const opt of entry.allowedGuardSteps) {
        guardLabels[opt.value] = opt.label;
      }
      for (const opt of entry.allowedPaymentTimings) {
        timingLabels[opt.value] = opt.label;
      }
    }
    return {
      triggerLabels,
      guardLabels,
      timingLabels,
      codeLabels,
      fulfilledStatusLabels,
      occurrenceLabels,
      periodLabels,
      arrearsLabels,
    };
  }, [catalogData]);

  const detailCharge = charges.find((c) => c.id === detailId);
  const detailEvent = detailCharge
    ? eventByCode.get(detailCharge.eventCode)
    : undefined;

  const columns = useMemo<ColumnsType<FeeCharge>>(
    () => [
      {
        title: "Fee type",
        dataIndex: "eventCode",
        key: "eventCode",
        ellipsis: true,
        render: (code: string) => {
          const event = eventByCode.get(code);
          return formatEventCodeLabel(code, { displayName: event?.name });
        },
      },
      {
        title: "Occurrence",
        dataIndex: "occurrenceKey",
        key: "occurrenceKey",
        ellipsis: true,
        render: (key: string) => (
          <Typography.Text code style={{ fontSize: token.fontSizeSM }}>
            {key}
          </Typography.Text>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status: string, record) => {
          const event = eventByCode.get(record.eventCode);
          const grandfathered = isGrandfatheredFeeCharge(record, event);
          return (
            <Flex gap={8} align="center" wrap="wrap">
              <span>{formatFeeChargeStatus(status)}</span>
              {grandfathered ? (
                <Tooltip title={FEE_CHARGE_UI_COPY.sessionLockInTooltip}>
                  <Tag color="warning" style={{ margin: 0 }}>
                    {FEE_CHARGE_UI_COPY.grandfatheredBadge}
                  </Tag>
                </Tooltip>
              ) : null}
            </Flex>
          );
        },
      },
      {
        title: "Policy ID",
        dataIndex: "billableEventPolicyId",
        key: "billableEventPolicyId",
        width: 100,
      },
      {
        title: "",
        key: "actions",
        width: 72,
        align: "right",
        render: (_: unknown, record) => (
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleOpenDetail(record.id)}
          />
        ),
      },
    ],
    [eventByCode, handleOpenDetail, token.fontSizeSM],
  );

  const cardState = isLoading ? "loading" : "default";

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <ExplainerCallout
        intent="info"
        collapsible
        title={FEE_CHARGE_UI_COPY.explainerTitle}
        body={FEE_CHARGE_UI_COPY.explainerBody}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="Total charges"
            value={totalItems}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <Flex gap={12} wrap="wrap">
        <Select
          placeholder="Any fee type"
          allowClear
          showSearch
          optionFilterProp="label"
          value={eventCodeFilter}
          onChange={handleEventCodeFilterChange}
          style={{ minWidth: 220 }}
          options={eventCodeOptions}
        />
        <Select
          placeholder="Any status"
          allowClear
          value={statusFilter}
          onChange={handleStatusFilterChange}
          style={{ minWidth: 160 }}
          options={[
            { value: "OPEN", label: "Open" },
            { value: "PAID", label: "Paid" },
            { value: "WAIVED", label: "Waived" },
            { value: "CANCELLED", label: "Cancelled" },
          ]}
        />
      </Flex>

      <DataLoader
        loading={isLoading}
        loader={<SkeletonRows count={4} variant="inline" />}
      >
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error={sectionError ?? "Failed to load fee charges."}
            onRetry={refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!hasData && !isFilterActive && !isError}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Title level={5} style={{ margin: 0, textAlign: "center" }}>
            {FEE_CHARGE_UI_COPY.emptyTitle}
          </Typography.Title>
          <Typography.Text
            type="secondary"
            style={{ display: "block", marginTop: 8, textAlign: "center" }}
          >
            {FEE_CHARGE_UI_COPY.emptyBody}
          </Typography.Text>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && hasData}>
          <Table
            columns={columns}
            dataSource={charges}
            rowKey="id"
            pagination={false}
            size="md"
          />
          <Flex justify="flex-end" style={{ marginTop: 16 }}>
            <Pagination
              current={page}
              pageSize={FEE_CHARGE_ITEMS_PER_PAGE}
              total={totalItems}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </Flex>
        </ConditionalRenderer>
      </DataLoader>

      <FeeChargeDetailDrawer
        chargeId={detailId}
        open={detailOpen}
        onClose={handleCloseDetail}
        event={detailEvent}
        labelMaps={labelMaps}
      />
    </Flex>
  );
}

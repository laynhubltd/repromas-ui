import type { BillableEvent } from "@/features/billing/tabs/fee-events/types/billable-event";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { GATEWAY_CONFIG_UI_COPY } from "@/shared/constants/gatewayConfigOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { MetadataRenderer } from "@/shared/ui/MetadataRenderer";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { EditOutlined } from "@ant-design/icons";
import { Alert, Badge, Button, Descriptions, Drawer, Flex, Tag, Typography } from "antd";
import { useMemo } from "react";
import { usePaymentGatewayConfigDrawer } from "../hooks/usePaymentGatewayConfigDrawer";
import type { TenantPaymentGatewayConfig } from "../types/payment-gateway-config";
import {
  formatGatewayConfigUpdatedAt,
  formatProviderLabel,
  getGatewayConfigStatusLabel,
  resolveScopeDescription,
  resolveScopeGuidedText,
  resolveScopeLabel,
} from "../utils/gatewayConfigDisplay";

type PaymentGatewayConfigDetailDrawerProps = {
  configId: number | null;
  open: boolean;
  onClose: () => void;
  eventById: Map<number, BillableEvent>;
  onEdit?: (config: TenantPaymentGatewayConfig) => void;
};

export function PaymentGatewayConfigDetailDrawer({
  configId,
  open,
  onClose,
  eventById,
  onEdit,
}: PaymentGatewayConfigDetailDrawerProps) {
  const { state, actions } = usePaymentGatewayConfigDrawer(configId, open);
  const { config, isLoading, isError, sectionError } = state;

  const drawerTitle = config
    ? formatProviderLabel(config.provider)
    : GATEWAY_CONFIG_UI_COPY.detailDrawerTitle;

  return (
    <Drawer
      title={drawerTitle}
      open={open}
      onClose={onClose}
      width={560}
      placement="right"
      destroyOnHidden
      footer={
        <Flex justify="flex-end">
          <PermissionGuard permission={Permission.BillingGatewayConfigsUpdate}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => config && onEdit?.(config)}
              disabled={!config}
            >
              Edit configuration
            </Button>
          </PermissionGuard>
        </Flex>
      }
    >
      <DataLoader
        loading={isLoading}
        loader={<SkeletonRows count={5} variant="card" />}
      >
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error={sectionError ?? GATEWAY_CONFIG_UI_COPY.loadDetailError}
            onRetry={actions.refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && config != null}>
          <GatewayConfigDetailBody config={config!} eventById={eventById} />
        </ConditionalRenderer>
      </DataLoader>
    </Drawer>
  );
}

function GatewayConfigDetailBody({
  config,
  eventById,
}: {
  config: TenantPaymentGatewayConfig;
  eventById: Map<number, BillableEvent>;
}) {
  const token = useToken();
  const scopeGuidedText = useMemo(
    () => resolveScopeGuidedText(config, eventById),
    [config, eventById],
  );
  const scopeDescription = useMemo(
    () => resolveScopeDescription(config, eventById),
    [config, eventById],
  );
  const isGlobalScope = config.billableEventId == null;
  const isInactiveEvent = config.billableEvent?.isActive === false;

  return (
    <Flex vertical gap={24}>
      <Alert
        type="warning"
        showIcon
        message="Credentials are sensitive. Do not share or copy outside authorized admin workflows."
      />

      <Descriptions bordered size="small" column={1}>
        <Descriptions.Item label="Scope">
          <Flex vertical gap={4}>
            <Flex align="center" gap={8} wrap="wrap">
              <ConditionalRenderer when={isGlobalScope}>
                <Badge
                  count="Global"
                  style={{
                    backgroundColor: token.colorPrimary,
                    fontSize: token.fontSizeSM,
                  }}
                />
              </ConditionalRenderer>
              <Typography.Text>
                {resolveScopeLabel(config, eventById)}
              </Typography.Text>
              <ConditionalRenderer when={isInactiveEvent}>
                <Tag color="warning">Inactive event</Tag>
              </ConditionalRenderer>
            </Flex>
            <ConditionalRenderer when={scopeDescription != null}>
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                {scopeDescription}
              </Typography.Text>
            </ConditionalRenderer>
            <ConditionalRenderer when={scopeGuidedText != null}>
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                {scopeGuidedText}
              </Typography.Text>
            </ConditionalRenderer>
          </Flex>
        </Descriptions.Item>
        <Descriptions.Item label="Provider">
          {formatProviderLabel(config.provider)}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={config.isActive ? "success" : "default"}>
            {getGatewayConfigStatusLabel(config)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Priority">{config.priority}</Descriptions.Item>
        <Descriptions.Item label="Created">
          {formatGatewayConfigUpdatedAt(config.createdAt)}
        </Descriptions.Item>
        <Descriptions.Item label="Updated">
          {formatGatewayConfigUpdatedAt(config.updatedAt)}
        </Descriptions.Item>
      </Descriptions>

      <MetadataRenderer
        title={GATEWAY_CONFIG_UI_COPY.credentialsTitle}
        value={config.credentials}
        variant="descriptions"
        size="small"
        bordered
        column={1}
        showRawToggle
        showCopyJson
      />
    </Flex>
  );
}

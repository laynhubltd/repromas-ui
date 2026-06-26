import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useGetBillableEventsQuery } from "@/features/billing/tabs/fee-events/api/billableEventApi";
import {
  GATEWAY_CONFIG_UI_COPY,
  GATEWAY_PROVIDER_OPTIONS,
} from "@/shared/constants/gatewayConfigOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import {
  Alert,
  Button,
  Collapse,
  Form,
  Modal,
  Select,
  Switch,
  Typography,
} from "antd";
import { useMemo } from "react";
import { usePaymentGatewayConfigFormModal } from "../../hooks/usePaymentGatewayConfigModal";
import type { TenantPaymentGatewayConfig } from "../../types/payment-gateway-config";
import { buildScopeOptions } from "../../utils/buildScopeOptions";
import {
  formatProviderLabel,
  resolveScopeGuidedText,
  resolveScopeLabel,
} from "../../utils/gatewayConfigDisplay";
import { providerRules, scopeRules } from "../../utils/validators";
import { GatewayCredentialFields } from "../GatewayCredentialFields";

type PaymentGatewayConfigFormModalProps = {
  open: boolean;
  target: TenantPaymentGatewayConfig | null;
  onClose: () => void;
  defaultGlobalFallback?: boolean;
  allConfigs: TenantPaymentGatewayConfig[];
  eventById: Map<
    number,
    import("@/features/billing/tabs/fee-events/types/billable-event").BillableEvent
  >;
};

export function PaymentGatewayConfigFormModal({
  open,
  target,
  onClose,
  defaultGlobalFallback = false,
  allConfigs,
  eventById,
}: PaymentGatewayConfigFormModalProps) {
  const token = useToken();

  const {
    state: {
      isEditMode,
      isSubmitting,
      isLoadingDetail,
      showAdvanced,
      pendingActivation,
      loadedConfig,
      configsForScope,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleConfirmActivation,
      handleCancelActivation,
      handleToggleAdvanced,
    },
    form,
  } = usePaymentGatewayConfigFormModal(target, open, onClose, {
    defaultGlobalFallback,
    allConfigs,
  });

  const providerValue = Form.useWatch("provider", form);

  const { data: eventsData, isLoading: isEventsLoading } =
    useGetBillableEventsQuery(
      {
        "exact[isActive]": true,
        sort: "code:asc",
        itemsPerPage: 100,
      },
      { skip: !open || isEditMode },
    );

  const scopeOptions = useMemo(() => {
    if (isEditMode) return [];
    const events = eventsData?.member ?? [];
    return buildScopeOptions(
      events,
      configsForScope,
      providerValue,
      loadedConfig?.id,
    );
  }, [
    isEditMode,
    eventsData?.member,
    configsForScope,
    providerValue,
    loadedConfig?.id,
  ]);

  const showAdvancedToggle =
    (isEditMode ? loadedConfig?.provider : providerValue) === "FLUTTERWAVE" ||
    (isEditMode ? loadedConfig?.provider : providerValue) === "REMITA";

  const showEditFields = isEditMode && loadedConfig != null;

  const scopeGuidedText = useMemo(
    () =>
      showEditFields
        ? resolveScopeGuidedText(loadedConfig, eventById)
        : null,
    [showEditFields, loadedConfig, eventById],
  );

  return (
    <>
      <Modal
        title={
          isEditMode
            ? GATEWAY_CONFIG_UI_COPY.editTitle
            : GATEWAY_CONFIG_UI_COPY.createTitle
        }
        open={open}
        onCancel={handleCancel}
        footer={null}
        width={560}
        destroyOnHidden
        closable
        styles={{
          body: { padding: `${token.paddingSM}px ${token.paddingSM}px` },
          header: {
            margin: 0,
            padding: `${token.paddingSM}px ${token.paddingSM}px`,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          },
        }}
      >
        <DataLoader loading={isLoadingDetail || isEventsLoading} minHeight={200}>
          <div style={{ padding: 24 }}>
            <ConditionalRenderer when={showEditFields}>
              <Alert
                type="info"
                showIcon
                message={GATEWAY_CONFIG_UI_COPY.scopeImmutableHint}
                style={{ marginBottom: 16 }}
              />
            </ConditionalRenderer>

            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              onFinish={handleSubmit}
            >
              <ConditionalRenderer when={showEditFields}>
                <Form.Item label="Scope">
                  <Typography.Text>
                    {resolveScopeLabel(loadedConfig, eventById)}
                  </Typography.Text>
                  <ConditionalRenderer when={scopeGuidedText != null}>
                    <Typography.Text
                      type="secondary"
                      style={{
                        display: "block",
                        marginTop: 4,
                        fontSize: token.fontSizeSM,
                      }}
                    >
                      {scopeGuidedText}
                    </Typography.Text>
                  </ConditionalRenderer>
                </Form.Item>
                <Form.Item label="Provider">
                  <Typography.Text>
                    {loadedConfig
                      ? formatProviderLabel(loadedConfig.provider)
                      : "—"}
                  </Typography.Text>
                </Form.Item>
              </ConditionalRenderer>

              <ConditionalRenderer when={!isEditMode}>
                <Alert
                  type="info"
                  showIcon
                  message={GATEWAY_CONFIG_UI_COPY.scopeRoutingHint}
                  style={{ marginBottom: 16 }}
                />

                <Form.Item
                  name="provider"
                  label="Provider"
                  rules={providerRules}
                >
                  <Select
                    placeholder="Select provider"
                    options={GATEWAY_PROVIDER_OPTIONS}
                    style={{ width: "100%" }}
                    onChange={() => form.setFieldValue("scopeValue", undefined)}
                  />
                </Form.Item>

                <Form.Item
                  name="scopeValue"
                  label="Scope"
                  rules={providerValue ? scopeRules : []}
                  extra={
                    providerValue
                      ? GATEWAY_CONFIG_UI_COPY.scopeSelectHelp
                      : GATEWAY_CONFIG_UI_COPY.scopeSelectProviderFirst
                  }
                >
                  <Select
                    placeholder={
                      providerValue
                        ? GATEWAY_CONFIG_UI_COPY.scopeSelectPlaceholder
                        : GATEWAY_CONFIG_UI_COPY.scopeSelectProviderFirstPlaceholder
                    }
                    disabled={!providerValue}
                    allowClear
                    options={scopeOptions}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </ConditionalRenderer>

              <Typography.Title level={5} style={{ margin: "8px 0 12px" }}>
                Credentials
              </Typography.Title>

              <ConditionalRenderer when={showAdvancedToggle}>
                <Collapse
                  ghost
                  activeKey={showAdvanced ? ["advanced"] : []}
                  onChange={(keys) =>
                    handleToggleAdvanced(keys.includes("advanced"))
                  }
                  items={[
                    {
                      key: "advanced",
                      label: "Advanced options",
                      children: null,
                    },
                  ]}
                  style={{ marginBottom: 8 }}
                />
              </ConditionalRenderer>

              <GatewayCredentialFields
                provider={
                  isEditMode ? (loadedConfig?.provider ?? undefined) : providerValue
                }
                showAdvanced={showAdvanced}
              />

              <Form.Item
                name="isActive"
                label="Active"
                valuePropName="checked"
                style={{ marginTop: 16 }}
              >
                <Switch />
              </Form.Item>

              <PermissionGuard
                permission={
                  isEditMode
                    ? Permission.BillingGatewayConfigsUpdate
                    : Permission.BillingGatewayConfigsCreate
                }
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  block
                  style={{ height: 48, fontWeight: 600, marginTop: 8 }}
                >
                  {isEditMode
                    ? GATEWAY_CONFIG_UI_COPY.editSubmit
                    : GATEWAY_CONFIG_UI_COPY.createSubmit}
                </Button>
              </PermissionGuard>
            </Form>
          </div>

          <div
            style={{
              padding: 24,
              borderTop: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgLayout,
            }}
          >
            <Button
              type="text"
              block
              onClick={handleCancel}
              disabled={isSubmitting}
              style={{
                height: 40,
                color: token.colorTextSecondary,
                fontWeight: 500,
                fontSize: token.fontSizeSM,
              }}
            >
              Cancel
            </Button>
          </div>
        </DataLoader>
      </Modal>

      <Modal
        title={GATEWAY_CONFIG_UI_COPY.activateConfirmTitle}
        open={pendingActivation}
        onCancel={handleCancelActivation}
        footer={null}
        width={440}
        destroyOnHidden
      >
        <div style={{ padding: "8px 0 16px" }}>
          <Typography.Paragraph>
            {GATEWAY_CONFIG_UI_COPY.activateConfirmBody}
          </Typography.Paragraph>
          <Button
            type="primary"
            block
            loading={isSubmitting}
            onClick={handleConfirmActivation}
            style={{ height: 44, fontWeight: 600, marginTop: 8 }}
          >
            Activate gateway
          </Button>
          <Button
            type="text"
            block
            onClick={handleCancelActivation}
            disabled={isSubmitting}
            style={{ marginTop: 8 }}
          >
            Go back
          </Button>
        </div>
      </Modal>
    </>
  );
}

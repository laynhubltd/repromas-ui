import { GATEWAY_CREDENTIAL_TOOLTIPS } from "@/shared/constants/gatewayConfigOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { Form, Input, Tooltip, Typography } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import type { GatewayProvider } from "../types/payment-gateway-config";
import { baseUrlRules, getCredentialFieldRules } from "../utils/validators";

type GatewayCredentialFieldsProps = {
  provider: GatewayProvider | undefined;
  showAdvanced: boolean;
};

function LabelWithTooltip({
  label,
  tooltip,
  required,
}: {
  label: string;
  tooltip: string;
  required?: boolean;
}) {
  const token = useToken();
  return (
    <span>
      {label}
      {required ? (
        <span style={{ color: token.colorError, fontWeight: 700 }}> *</span>
      ) : null}{" "}
      <Tooltip title={tooltip}>
        <QuestionCircleOutlined
          style={{ color: token.colorTextTertiary, fontSize: token.fontSizeSM }}
        />
      </Tooltip>
    </span>
  );
}

export function GatewayCredentialFields({
  provider,
  showAdvanced,
}: GatewayCredentialFieldsProps) {
  if (!provider) {
    return (
      <Typography.Text type="secondary">
        Select a provider to enter credentials.
      </Typography.Text>
    );
  }

  return (
    <>
      <ConditionalRenderer when={provider === "PAYSTACK" || provider === "FLUTTERWAVE"}>
        <Form.Item
          name={["credentials", "public_key"]}
          label={
            <LabelWithTooltip
              label="Public key"
              tooltip={GATEWAY_CREDENTIAL_TOOLTIPS.public_key}
              required
            />
          }
          rules={getCredentialFieldRules(provider, "public_key")}
        >
          <Input.Password
            placeholder="pk_test_… or FLWPUBK_TEST-…"
            autoComplete="new-password"
            style={{ height: 40 }}
          />
        </Form.Item>

        <Form.Item
          name={["credentials", "secret_key"]}
          label={
            <LabelWithTooltip
              label="Secret key"
              tooltip={GATEWAY_CREDENTIAL_TOOLTIPS.secret_key}
              required
            />
          }
          rules={getCredentialFieldRules(provider, "secret_key")}
        >
          <Input.Password
            placeholder="sk_test_… or FLWSECK_TEST-…"
            autoComplete="new-password"
            style={{ height: 40 }}
          />
        </Form.Item>
      </ConditionalRenderer>

      <ConditionalRenderer when={provider === "FLUTTERWAVE"}>
        <Form.Item
          name={["credentials", "webhook_secret"]}
          label={
            <LabelWithTooltip
              label="Webhook secret"
              tooltip={GATEWAY_CREDENTIAL_TOOLTIPS.webhook_secret}
              required
            />
          }
          rules={getCredentialFieldRules(provider, "webhook_secret")}
        >
          <Input.Password
            placeholder="Webhook hash secret"
            autoComplete="new-password"
            style={{ height: 40 }}
          />
        </Form.Item>
      </ConditionalRenderer>

      <ConditionalRenderer when={provider === "REMITA"}>
        <Form.Item
          name={["credentials", "merchant_id"]}
          label={
            <LabelWithTooltip
              label="Merchant ID"
              tooltip={GATEWAY_CREDENTIAL_TOOLTIPS.merchant_id}
              required
            />
          }
          rules={getCredentialFieldRules(provider, "merchant_id")}
        >
          <Input placeholder="Merchant ID" style={{ height: 40 }} />
        </Form.Item>

        <Form.Item
          name={["credentials", "service_type_id"]}
          label={
            <LabelWithTooltip
              label="Service type ID"
              tooltip={GATEWAY_CREDENTIAL_TOOLTIPS.service_type_id}
              required
            />
          }
          rules={getCredentialFieldRules(provider, "service_type_id")}
        >
          <Input placeholder="Service type ID" style={{ height: 40 }} />
        </Form.Item>

        <Form.Item
          name={["credentials", "api_key"]}
          label={
            <LabelWithTooltip
              label="API key"
              tooltip={GATEWAY_CREDENTIAL_TOOLTIPS.api_key}
              required
            />
          }
          rules={getCredentialFieldRules(provider, "api_key")}
        >
          <Input.Password
            placeholder="API key"
            autoComplete="new-password"
            style={{ height: 40 }}
          />
        </Form.Item>
      </ConditionalRenderer>

      <ConditionalRenderer
        when={
          showAdvanced &&
          (provider === "FLUTTERWAVE" || provider === "REMITA")
        }
      >
        <Form.Item
          name={["credentials", "base_url"]}
          label={
            <LabelWithTooltip
              label="Base URL"
              tooltip={GATEWAY_CREDENTIAL_TOOLTIPS.base_url}
            />
          }
          rules={baseUrlRules}
        >
          <Input
            placeholder={
              provider === "REMITA"
                ? "https://demo.remita.net/…"
                : "https://api.flutterwave.com/v3"
            }
            style={{ height: 40 }}
          />
        </Form.Item>
      </ConditionalRenderer>
    </>
  );
}

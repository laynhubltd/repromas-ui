import {
  GATEWAY_CONFIG_UI_COPY,
  GATEWAY_PROVIDER_OPTIONS,
  GATEWAY_WEBHOOK_PATHS,
} from "@/shared/constants/gatewayConfigOptions";
import { useToken } from "@/shared/hooks/useToken";
import { CopyOutlined, LinkOutlined } from "@ant-design/icons";
import { Button, Collapse, Flex, Typography, message } from "antd";

function buildWebhookUrl(path: string): string {
  const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function GatewayWebhookHelpPanel() {
  const token = useToken();

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      message.success("Webhook URL copied.");
    } catch {
      message.error("Could not copy URL.");
    }
  };

  const items = GATEWAY_PROVIDER_OPTIONS.map((provider) => {
    const path = GATEWAY_WEBHOOK_PATHS[provider.value];
    const url = buildWebhookUrl(path);

    return {
      key: provider.value,
      label: (
        <Flex align="center" gap={8}>
          <LinkOutlined />
          <span>{provider.label}</span>
        </Flex>
      ),
      children: (
        <Flex vertical gap={8}>
          <Typography.Text
            code
            style={{
              display: "block",
              padding: token.paddingSM,
              background: token.colorBgLayout,
              borderRadius: token.borderRadius,
              fontSize: token.fontSizeSM,
              wordBreak: "break-all",
            }}
          >
            POST {url}
          </Typography.Text>
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopy(url)}
            style={{ padding: 0, alignSelf: "flex-start" }}
          >
            Copy URL
          </Button>
        </Flex>
      ),
    };
  });

  return (
    <Flex vertical gap={8}>
      <Typography.Title level={5} style={{ margin: 0 }}>
        {GATEWAY_CONFIG_UI_COPY.webhookPanelTitle}
      </Typography.Title>
      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
        {GATEWAY_CONFIG_UI_COPY.webhookPanelHint}
      </Typography.Text>
      <Collapse items={items} bordered={false} />
    </Flex>
  );
}

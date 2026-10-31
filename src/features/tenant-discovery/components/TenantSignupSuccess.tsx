import { CheckCircleFilled, CopyOutlined, ExportOutlined } from "@ant-design/icons";
import { Alert, Button, Flex, message, Tag, Typography } from "antd";
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import type { TenantSignupResponse } from "../types";
import { buildTenantLoginUrl } from "../utils";

export type TenantSignupSuccessProps = {
  response: TenantSignupResponse;
};

export function TenantSignupSuccess({ response }: TenantSignupSuccessProps) {
  const { tenant, brandConfig } = response;
  const [copied, setCopied] = useState(false);

  const loginUrl = buildTenantLoginUrl(tenant.slug);

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(loginUrl);
      setCopied(true);
      message.success("Tenant login URL copied to clipboard.");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      message.info(`Your tenant URL is: ${loginUrl}`);
    }
  }, [loginUrl]);

  return (
    <Flex vertical gap={24} style={{ padding: "8px 0" }}>
      <Flex align="center" gap={12} wrap="wrap">
        <CheckCircleFilled style={{ fontSize: 32, color: "#10b981" }} />
        <div>
          <Typography.Title level={3} style={{ margin: 0, color: "#1e1b4b" }}>
            Welcome to REPROMAS, {tenant.name}!
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 14 }}>
            Your dedicated institution workspace is live and ready.
          </Typography.Text>
        </div>
      </Flex>

      <Flex align="center" gap={10} wrap="wrap">
        <Tag color="success" style={{ padding: "4px 10px", fontSize: 13, borderRadius: 6 }}>
          Status: Active · Workspace Ready
        </Tag>
        {tenant.institutionTypeLabel && (
          <Tag color="purple" style={{ padding: "4px 10px", fontSize: 13, borderRadius: 6 }}>
            {tenant.institutionTypeLabel}
          </Tag>
        )}
      </Flex>

      {/* Tenant URL highlight box */}
      <div
        style={{
          border: "1px solid #c4b5fd",
          borderRadius: 12,
          padding: 16,
          background: "#faf5ff",
        }}
      >
        <Typography.Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
          Your Institution Portal Address
        </Typography.Text>
        <Flex justify="space-between" align="center" gap={12} wrap="wrap">
          <Typography.Text strong style={{ fontSize: 16, color: "#2e1065" }}>
            {loginUrl}
          </Typography.Text>
          <Button icon={<CopyOutlined />} size="small" onClick={handleCopyUrl}>
            {copied ? "Copied!" : "Copy Address"}
          </Button>
        </Flex>
      </div>

      {/* Activation Email Notice */}
      <Alert
        type="info"
        showIcon
        message="Next Step: Set Your Administrator Password"
        description={
          <div style={{ marginTop: 4, lineHeight: 1.6 }}>
            An activation link has been sent to <strong>{tenant.email}</strong>. Please check your inbox (and spam folder) and click the link to set your password. Once set, you can sign in directly with full System Administrator access.
          </div>
        }
      />

      {/* Logo confirmation if uploaded */}
      {brandConfig?.configValue?.logoUrl && (
        <Flex align="center" gap={12} style={{ padding: 12, borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <img
            src={brandConfig.configValue.logoUrl}
            alt="Uploaded logo"
            style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 6, background: "#fff", padding: 2 }}
          />
          <div>
            <Typography.Text strong style={{ fontSize: 13, display: "block" }}>
              Institution Logo Configured
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Stored securely in tenant storage and pre-loaded across your portal and broadsheet headers.
            </Typography.Text>
          </div>
        </Flex>
      )}

      {/* Action Buttons */}
      <Flex gap={12} wrap="wrap" style={{ marginTop: 8 }}>
        <Button
          type="primary"
          size="large"
          icon={<ExportOutlined />}
          href={loginUrl}
          style={{
            background: "#fbbf24",
            color: "#140630",
            fontWeight: 700,
            borderColor: "#f59e0b",
            borderRadius: 999,
            paddingInline: 24,
            height: 48,
          }}
        >
          Go to Workspace Login
        </Button>
        <Link to="/contact">
          <Button size="large" style={{ borderRadius: 999, height: 48 }}>
            Need Assistance? Talk to Support
          </Button>
        </Link>
      </Flex>
    </Flex>
  );
}

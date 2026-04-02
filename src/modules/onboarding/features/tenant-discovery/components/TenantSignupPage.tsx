import { Alert, Button, Card, Form, Input, Space, Typography } from "antd";
import { useMemo, useState } from "react";
import { useValidateTenantQuery } from "../api/tenant-validation-api";
import {
  buildTenantLoginUrl,
  isTenantActive,
  readApiErrorMessage,
} from "../utils";

const { Paragraph, Title, Text } = Typography;

type TenantForm = {
  slug: string;
};

export default function TenantSignupPage() {
  const [submittedSlug, setSubmittedSlug] = useState<string | null>(null);

  const normalizedSlug = useMemo(
    () => submittedSlug?.trim().toLowerCase() ?? "",
    [submittedSlug],
  );

  const query = useValidateTenantQuery(
    { slug: normalizedSlug },
    { skip: normalizedSlug.length === 0 },
  );

  const institution = query.data;
  const active = isTenantActive(institution?.status);

  const onFinish = (values: TenantForm) => {
    setSubmittedSlug(values.slug);
  };

  const onContinue = () => {
    if (!institution?.slug) return;

    const tenantSlug = institution.slug.trim().toLowerCase();
    localStorage.setItem("tenant_slug", tenantSlug);
    window.location.assign(buildTenantLoginUrl(tenantSlug));
  };

  const errorMessage = readApiErrorMessage(query.error);

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <Space direction="vertical" size={18} style={{ width: "100%" }}>
        <Title level={2} style={{ marginBottom: 0 }}>
          Find your institution
        </Title>
        <Paragraph type="secondary" style={{ marginTop: 0 }}>
          Enter your institution slug to continue to your tenant login.
        </Paragraph>

        <Card>
          <Form<TenantForm> layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="slug"
              label="Institution slug"
              rules={[
                { required: true, message: "Slug is required" },
                {
                  pattern: /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
                  message: "Use letters, numbers, and hyphens only",
                },
              ]}
            >
              <Input placeholder="e.g. university-of-lagos" autoComplete="off" />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={query.isFetching}>
              Validate institution
            </Button>
          </Form>
        </Card>

        {query.isError && (
          <Alert
            type="error"
            message="Institution not found"
            description={
              errorMessage ?? "Institution not found. Check the slug and try again."
            }
            showIcon
          />
        )}

        {query.isSuccess && institution && !active && (
          <Alert
            type="warning"
            message="This institution is not currently active"
            description={`Status: ${institution.status ?? "UNKNOWN"}`}
            showIcon
          />
        )}

        {query.isSuccess && institution && active && (
          <Alert
            type="success"
            message="Institution validated"
            description={
              <Space direction="vertical" size={4}>
                <Text>
                  <strong>{institution.name ?? institution.slug}</strong>
                </Text>
                <Text type="secondary">Slug: {institution.slug}</Text>
                <Button type="primary" onClick={onContinue}>
                  Continue to login
                </Button>
              </Space>
            }
            showIcon
          />
        )}
      </Space>
    </div>
  );
}

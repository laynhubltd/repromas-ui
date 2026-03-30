import { appPaths } from "@/app/routing/app-path";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { useForgotPasswordMutation } from "@/features/auth/api/auth-api";
import { useToken } from "@/shared/hooks/useToken";
import { validators } from "@/shared/utils/validators";
import { CheckCircleOutlined, MailOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Typography } from "antd";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

export default function ForgotPassword() {
  const [form] = Form.useForm();
  const t = useToken();
  const [forgotPassword, { isLoading, isSuccess, isError, error }] =
    useForgotPasswordMutation();

  const onFinish = async (values: { email: string }) => {
    await forgotPassword({ email: values.email });
  };

  return (
    <AuthPageLayout illustration="reset">
      {isSuccess ? (
        <>
          <div style={{ textAlign: "center", marginBottom: t.sizeXXL * 1.5 }}>
            <CheckCircleOutlined
              style={{
                fontSize: 64,
                color: t.colorSuccess,
                marginBottom: t.sizeLG,
              }}
            />
            <Title
              level={2}
              style={{
                margin: 0,
                marginBottom: t.sizeXS,
                color: t.colorText,
                fontWeight: t.fontWeightStrong,
                fontSize: t.fontSizeHeading2,
              }}
            >
              Check your email
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: t.fontSize, color: t.colorTextSecondary }}
            >
              We've sent password reset instructions to your email address
            </Text>
          </div>

          <Alert
            message="Email sent"
            description="If an account exists with this email, a password reset link has been sent. Please check your inbox and follow the instructions."
            type="success"
            showIcon
            style={{ marginBottom: t.sizeLG }}
          />

          <div
            style={{
              textAlign: "center",
              paddingTop: t.sizeLG,
              borderTop: `1px solid ${t.colorBorderSecondary}`,
            }}
          >
            <Link
              to={appPaths.login}
              className="auth-link"
              style={{
                fontSize: t.fontSizeSM,
                color: t.colorPrimary,
                textDecoration: "none",
              }}
            >
              Back to sign in
            </Link>
          </div>
        </>
      ) : (
        <>
          <div style={{ textAlign: "center", marginBottom: t.sizeXXL * 1.5 }}>
            <Title
              level={2}
              style={{
                margin: 0,
                marginBottom: t.sizeXS,
                color: t.colorText,
                fontWeight: t.fontWeightStrong,
                fontSize: t.fontSizeHeading2,
              }}
            >
              Forgot password?
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: t.fontSize, color: t.colorTextSecondary }}
            >
              Enter your email and we'll send you a link to reset your password
            </Text>
          </div>

          {isError && (
            <Alert
              type="error"
              message={
                error && "data" in error
                  ? (error.data as { message?: string })?.message ??
                    "Failed to send reset link"
                  : "Failed to send reset link"
              }
              style={{ marginBottom: t.sizeMD }}
              showIcon
            />
          )}

          <Form
            form={form}
            name="forgotPassword"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter your email address" },
                {
                  validator: (_, value) =>
                    !value || validators.email(value)
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Please enter a valid email address"),
                        ),
                },
              ]}
              style={{ marginBottom: t.sizeLG }}
            >
              <Input
                prefix={<MailOutlined style={{ color: t.colorTextTertiary }} />}
                placeholder="Email address"
                type="email"
                style={{
                  height: t.controlHeightLG,
                  fontSize: t.fontSize,
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: t.sizeLG }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isLoading}
                style={{
                  height: t.controlHeightLG,
                  fontSize: t.fontSize,
                  fontWeight: t.fontWeightStrong,
                }}
              >
                Send reset link
              </Button>
            </Form.Item>
          </Form>

          <div
            style={{
              textAlign: "center",
              paddingTop: t.sizeLG,
              borderTop: `1px solid ${t.colorBorderSecondary}`,
            }}
          >
            <Link
              to={appPaths.login}
              className="auth-link"
              style={{
                fontSize: t.fontSizeSM,
                color: t.colorPrimary,
                textDecoration: "none",
              }}
            >
              Back to sign in
            </Link>
          </div>
        </>
      )}
    </AuthPageLayout>
  );
}

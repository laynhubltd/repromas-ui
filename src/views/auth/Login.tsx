import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import useAuth from "@/features/auth/use-auth";
import { useToken } from "@/hooks/useToken";
import { appPaths } from "@/routing/app-path";
import { validators } from "@/utils/validators";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Typography } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

export default function Login() {
  const [form] = Form.useForm();
  const t = useToken();
  const { login, isLoggingIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login({ email: values.email, password: values.password });
      message.success("Signed in successfully");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout illustration="login">
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
          Welcome back
        </Title>
        <Text
          type="secondary"
          style={{ fontSize: t.fontSize, color: t.colorTextSecondary }}
        >
          Sign in to your Repromas account
        </Text>
      </div>

      <Form
        form={form}
        name="login"
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
            prefix={<UserOutlined style={{ color: t.colorTextTertiary }} />}
            placeholder="Email address"
            type="email"
            style={{
              height: t.controlHeightLG,
              fontSize: t.fontSize,
            }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please enter your password" }]}
          style={{ marginBottom: t.sizeMD }}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: t.colorTextTertiary }} />}
            placeholder="Password"
            style={{
              height: t.controlHeightLG,
              fontSize: t.fontSize,
            }}
          />
        </Form.Item>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: t.sizeLG,
          }}
        >
          <Link
            to={appPaths.forgotPassword}
            className="auth-link"
            style={{
              fontSize: t.fontSizeSM,
              color: t.colorPrimary,
              textDecoration: "none",
            }}
          >
            Forgot password?
          </Link>
        </div>

        <Form.Item style={{ marginBottom: t.sizeLG }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading || isLoggingIn}
            style={{
              height: t.controlHeightLG,
              fontSize: t.fontSize,
              fontWeight: t.fontWeightStrong,
            }}
          >
            Sign in
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
        <Text
          type="secondary"
          style={{ fontSize: t.fontSizeSM, color: t.colorTextSecondary }}
        >
          Don't have an account?{" "}
          <Link
            to={appPaths.signUp}
            className="auth-link"
            style={{
              color: t.colorPrimary,
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Sign up
          </Link>
        </Text>
      </div>
    </AuthPageLayout>
  );
}

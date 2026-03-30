import { appPaths } from "@/app/routing/app-path";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { useLoginMutation } from "@/features/auth/api/auth-api";
import { useToken } from "@/shared/hooks/useToken";
import { validators } from "@/shared/utils/validators";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Typography } from "antd";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

export default function Login() {
  const [form] = Form.useForm();
  const t = useToken();
  const [login, { isLoading, isError, error }] = useLoginMutation();

  const onFinish = async (values: { email: string; password: string }) => {
    await login({ email: values.email, password: values.password }).unwrap();
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

      {isError && (
        <Alert
          type="error"
          message={
            error && "data" in error
              ? (error.data as { message?: string })?.message ?? "Login failed"
              : "Login failed"
          }
          style={{ marginBottom: t.sizeMD }}
          showIcon
        />
      )}

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
            loading={isLoading}
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

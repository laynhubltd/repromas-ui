import { appPaths } from "@/app/routing/app-path";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { useSignUpMutation } from "@/features/auth/api/auth-api";
import { useToken } from "@/shared/hooks/useToken";
import { validators } from "@/shared/utils/validators";
import { UserOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Typography } from "antd";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

export default function SignUp() {
  const [form] = Form.useForm();
  const t = useToken();
  const [signUp, { isLoading, isError, error }] = useSignUpMutation();

  const onFinish = async (values: { email: string; password: string }) => {
    await signUp({ email: values.email, password: values.password });
  };

  return (
    <AuthPageLayout illustration="signup">
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
          Create your account
        </Title>
        <Text
          type="secondary"
          style={{ fontSize: t.fontSize, color: t.colorTextSecondary }}
        >
          Sign up to get started with Repromas
        </Text>
      </div>

      {isError && (
        <Alert
          type="error"
          message={
            error && "data" in error
              ? (error.data as { message?: string })?.message ?? "Sign up failed"
              : "Sign up failed"
          }
          style={{ marginBottom: t.sizeMD }}
          showIcon
        />
      )}

      <Form
        form={form}
        name="signup"
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
          style={{ marginBottom: t.sizeLG }}
        >
          <Input.Password
            prefix={<UserOutlined style={{ color: t.colorTextTertiary }} />}
            placeholder="Password"
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
            Create account
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
          Already have an account?{" "}
          <Link
            to={appPaths.login}
            className="auth-link"
            style={{
              color: t.colorPrimary,
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Sign in
          </Link>
        </Text>
      </div>
    </AuthPageLayout>
  );
}

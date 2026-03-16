import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { useToken } from "@/hooks/useToken";
import { appPaths } from "@/routing/app-path";
import { validators } from "@/utils/validators";
import { UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Typography } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

export default function SignUp() {
  const [form] = Form.useForm();
  const t = useToken();
  const [loading, setLoading] = useState(false);

  const onFinish = async (_values: { email: string }) => {
    setLoading(true);
    try {
      // TODO: wire to authApi.signUp when endpoint exists
      await new Promise((r) => setTimeout(r, 600));
      message.success("Account created. Please sign in.");
      window.location.href = appPaths.login;
    } catch {
      message.error("Sign up failed. Try again.");
    } finally {
      setLoading(false);
    }
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

        <Form.Item style={{ marginBottom: t.sizeLG }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
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

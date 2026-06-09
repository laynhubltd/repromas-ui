import { appPaths } from "@/app/routing/app-path";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import {
  PASSWORD_RESET_BACK_TO_SIGN_IN,
  PASSWORD_RESET_FORGOT_RETRY_HINT,
  PASSWORD_RESET_FORGOT_SUCCESS_MESSAGE,
  PASSWORD_RESET_FORGOT_SUCCESS_TITLE,
  PASSWORD_RESET_TRY_AGAIN_LABEL,
} from "@/shared/constants/passwordResetOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { CheckCircleOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Form, Input, Typography } from "antd";
import { Link } from "react-router-dom";
import { useForgotPassword } from "../hooks/useForgotPassword";
import { emailRules } from "../utils/validators";

const { Title, Text } = Typography;

export default function ForgotPassword() {
  const t = useToken();
  const { state, actions, flags } = useForgotPassword();

  return (
    <AuthPageLayout illustration="reset">
      <ConditionalRenderer when={flags.isSuccess}>
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
            {PASSWORD_RESET_FORGOT_SUCCESS_TITLE}
          </Title>
          <Text
            type="secondary"
            style={{ fontSize: t.fontSize, color: t.colorTextSecondary }}
          >
            {PASSWORD_RESET_FORGOT_SUCCESS_MESSAGE}
          </Text>
        </div>

        <Text
          type="secondary"
          style={{
            display: "block",
            textAlign: "center",
            marginBottom: t.sizeLG,
            fontSize: t.fontSizeSM,
          }}
        >
          {PASSWORD_RESET_FORGOT_RETRY_HINT}
        </Text>

        <Button
          type="default"
          block
          size="large"
          onClick={actions.handleTryAgain}
          disabled={flags.submitCooldown}
          style={{
            height: t.controlHeightLG,
            marginBottom: t.sizeMD,
          }}
        >
          {PASSWORD_RESET_TRY_AGAIN_LABEL}
        </Button>

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
            {PASSWORD_RESET_BACK_TO_SIGN_IN}
          </Link>
        </div>
      </ConditionalRenderer>

      <ConditionalRenderer when={!flags.isSuccess}>
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
            Enter your email and we&apos;ll send you a link to reset your password
          </Text>
        </div>

        <Form
          form={state.form}
          name="forgotPassword"
          onFinish={actions.handleSubmit}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <Form.Item name="email" rules={emailRules} style={{ marginBottom: t.sizeLG }}>
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
              loading={flags.isLoading}
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
            {PASSWORD_RESET_BACK_TO_SIGN_IN}
          </Link>
        </div>
      </ConditionalRenderer>
    </AuthPageLayout>
  );
}

import { appPaths } from "@/app/routing/app-path";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import {
  PASSWORD_RESET_BACK_TO_SIGN_IN,
  PASSWORD_RESET_PAGE_SUBTITLE,
  PASSWORD_RESET_PAGE_TITLE,
  PASSWORD_RESET_REQUEST_NEW_LINK,
  PASSWORD_RESET_SUBMIT_LABEL,
  PASSWORD_RESET_TOKEN_MISSING_MESSAGE,
  PASSWORD_RESET_TOKEN_MISSING_TITLE,
} from "@/shared/constants/passwordResetOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { LockOutlined } from "@ant-design/icons";
import { Button, Form, Input, Typography } from "antd";
import { Link } from "react-router-dom";
import { useResetPassword } from "../hooks/useResetPassword";
import { confirmPasswordRules, passwordRules } from "../utils/validators";

const { Title, Text } = Typography;

export default function ResetPassword() {
  const t = useToken();
  const { state, actions, flags } = useResetPassword();

  return (
    <AuthPageLayout illustration="reset">
      <ConditionalRenderer when={flags.tokenMissing}>
        <div style={{ textAlign: "center", marginBottom: t.sizeXXL }}>
          <Title level={2} style={{ margin: 0, marginBottom: t.sizeSM }}>
            {PASSWORD_RESET_TOKEN_MISSING_TITLE}
          </Title>
          <Text type="secondary">{PASSWORD_RESET_TOKEN_MISSING_MESSAGE}</Text>
        </div>
        <Button type="primary" block size="large" onClick={actions.handleRequestNewLink}>
          {PASSWORD_RESET_REQUEST_NEW_LINK}
        </Button>
      </ConditionalRenderer>

      <ConditionalRenderer when={!flags.tokenMissing}>
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
            {PASSWORD_RESET_PAGE_TITLE}
          </Title>
          <Text
            type="secondary"
            style={{ fontSize: t.fontSize, color: t.colorTextSecondary }}
          >
            {PASSWORD_RESET_PAGE_SUBTITLE}
          </Text>
        </div>

        <ErrorAlert
          variant="section"
          error={state.sectionError}
          action={
            <Button type="link" onClick={actions.handleRequestNewLink}>
              {PASSWORD_RESET_REQUEST_NEW_LINK}
            </Button>
          }
        />

        <DataLoader loading={flags.isLoading} minHeight="120px">
          <Form
            form={state.form}
            name="resetPassword"
            onFinish={actions.handleSubmit}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="newPassword"
              rules={passwordRules}
              style={{ marginBottom: t.sizeLG }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: t.colorTextTertiary }} />}
                placeholder="New password"
                autoComplete="new-password"
                style={{
                  height: t.controlHeightLG,
                  fontSize: t.fontSize,
                }}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={confirmPasswordRules(() =>
                state.form.getFieldValue("newPassword"),
              )}
              style={{ marginBottom: t.sizeLG }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: t.colorTextTertiary }} />}
                placeholder="Confirm new password"
                autoComplete="new-password"
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
                disabled={flags.submitDisabled}
                style={{
                  height: t.controlHeightLG,
                  fontSize: t.fontSize,
                  fontWeight: t.fontWeightStrong,
                }}
              >
                {PASSWORD_RESET_SUBMIT_LABEL}
              </Button>
            </Form.Item>
          </Form>
        </DataLoader>

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

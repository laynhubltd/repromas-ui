import { appPaths } from "@/app/routing/app-path";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { AdmissionProcessTour } from "@/features/auth/candidate-signup/components/AdmissionProcessTour";
import { AdmissionsOpenEditorialPanel } from "@/features/auth/candidate-signup/components/AdmissionsOpenEditorialPanel";
import { AdmissionsOpenMobileBanner } from "@/features/auth/candidate-signup/components/AdmissionsOpenMobileBanner";
import { useLogin } from "@/features/auth/hooks/useLogin";
import {
  emailRules,
  loginPasswordRules,
} from "@/features/auth/utils/validators";
import { CANDIDATE_SIGNUP_UI_COPY } from "@/shared/constants/candidateSignupOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Typography } from "antd";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

export default function Login() {
  const [form] = Form.useForm();
  const t = useToken();
  const { state, actions, flags } = useLogin();
  const {
    isLoading,
    isError,
    errorMessage,
    wasIdleLogout,
    admissionEditorial,
    tourCtaElement,
  } = state;
  const {
    handleFinish,
    setTourCtaRef,
    handleDismissTour,
    handleFormFocus,
    handleOpenGuide,
    handleStartRegistration,
  } = actions;
  const { isCandidateSignupAvailable, isTourOpen } = flags;

  const hasOpenAdmissions =
    isCandidateSignupAvailable && admissionEditorial !== null;

  return (
    <AuthPageLayout
      illustration="login"
      illustrationDimmed={isTourOpen}
      bottomPanel={
        hasOpenAdmissions ? (
          <AdmissionsOpenEditorialPanel
            model={admissionEditorial}
            onCtaRef={setTourCtaRef}
            onCtaClick={handleDismissTour}
            onOpenGuide={handleOpenGuide}
          />
        ) : undefined
      }
    >
      <div style={{ textAlign: "center", marginBottom: t.sizeXL }}>
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

      <ConditionalRenderer when={wasIdleLogout && !isError}>
        <Alert
          type="info"
          message="You were signed out due to inactivity"
          description="For your security, sessions end after a period of inactivity. Please sign in again."
          style={{ marginBottom: t.sizeMD }}
          showIcon
        />
      </ConditionalRenderer>

      <ConditionalRenderer when={isError && errorMessage !== null}>
        <Alert
          type="error"
          message={errorMessage ?? "Login failed"}
          style={{ marginBottom: t.sizeMD }}
          showIcon
        />
      </ConditionalRenderer>

      <Form
        form={form}
        name="login"
        onFinish={handleFinish}
        onFocusCapture={handleFormFocus}
        layout="vertical"
        size="large"
        requiredMark={false}
      >
        <Form.Item
          name="email"
          rules={emailRules}
          style={{ marginBottom: t.sizeMD }}
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
          rules={loginPasswordRules}
          style={{ marginBottom: t.sizeSM }}
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
            marginBottom: t.sizeMD,
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

        <Form.Item style={{ marginBottom: t.sizeMD }}>
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

      <ConditionalRenderer when={hasOpenAdmissions}>
        <div className="auth-mobile-only">
          {admissionEditorial ? (
            <AdmissionsOpenMobileBanner
              model={admissionEditorial}
              onApply={handleStartRegistration}
            />
          ) : null}
        </div>
      </ConditionalRenderer>

      <ConditionalRenderer when={hasOpenAdmissions}>
        <div
          className="auth-desktop-only"
          style={{ textAlign: "center", paddingTop: t.sizeXS }}
        >
          <Text type="secondary" style={{ fontSize: t.fontSizeSM }}>
            {CANDIDATE_SIGNUP_UI_COPY.loginInlinePrompt}{" "}
            <Link
              to={admissionEditorial?.signUpHref ?? appPaths.candidateSignUp}
              onClick={handleDismissTour}
              style={{
                color: t.colorPrimary,
                fontWeight: t.fontWeightStrong,
                textDecoration: "none",
              }}
            >
              {CANDIDATE_SIGNUP_UI_COPY.loginInlineLink}
            </Link>
          </Text>
        </div>
      </ConditionalRenderer>

      <ConditionalRenderer when={hasOpenAdmissions}>
        {admissionEditorial ? (
          <AdmissionProcessTour
            open={isTourOpen}
            target={tourCtaElement}
            model={admissionEditorial}
            onClose={handleDismissTour}
            onStartRegistration={handleStartRegistration}
          />
        ) : null}
      </ConditionalRenderer>
    </AuthPageLayout>
  );
}
